import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createHash } from 'crypto';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import Activity from '../models/Activity.js';
import logger from '../utils/logger.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
};

const hashRefreshToken = (token) => createHash('sha256').update(String(token)).digest('hex');

const readRefreshTokenFromRequest = (req) =>
  req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken || null;

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: undefined,
  });
};

const saveUserRefreshToken = async (userId, refreshToken, decodedRefreshToken) => {
  const expiresAt = decodedRefreshToken?.exp
    ? new Date(decodedRefreshToken.exp * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: hashRefreshToken(refreshToken),
    refreshTokenExpiresAt: expiresAt,
    updatedAt: new Date(),
  });
};

const invalidateUserRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
    updatedAt: new Date(),
  });
};

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, email, and password are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      firstName,
      lastName: lastName || '',
      email: email.toLowerCase(),
      phone: phone || null,
      password: hashedPassword,
      role: 'user',
    });

    await user.save();

    // Create activity record
    await Activity.create({
      userId: user._id,
      type: 'signup',
      description: 'Account created',
    });

    const token = generateToken(user._id, user.email, user.role, {});

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.role && user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Use admin login endpoint for admin accounts',
      });
    }

    if (typeof user.password !== 'string' || !user.password) {
      logger.warn('Login blocked due to missing password hash', {
        email: normalizedEmail,
        userId: String(user._id),
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    try {
      await Activity.create({
        userId: user._id,
        type: 'login',
        description: 'User logged in',
        metadata: {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      });
    } catch (activityError) {
      logger.warn('Failed to persist login activity', {
        userId: String(user._id),
        error: activityError.message,
      });
    }

    const token = generateToken(user._id, user.email, user.role, {});
    const refreshToken = generateRefreshToken(user._id);
    const decodedRefreshToken = verifyRefreshToken(refreshToken);

    if (!decodedRefreshToken?.userId) {
      logger.error('Generated refresh token could not be decoded during login', {
        userId: String(user._id),
      });
      return res.status(500).json({
        success: false,
        message: 'Unable to complete login. Please try again.',
      });
    }

    await saveUserRefreshToken(user._id, refreshToken, decodedRefreshToken);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    res.json({
      success: true,
      message: 'Login successful',
      token,
      adminAccess: false,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login failed due to server-side error', {
      email: String(req.body?.email || '').trim().toLowerCase() || undefined,
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: 'Unable to complete login. Please try again.',
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const providedRefreshToken = readRefreshTokenFromRequest(req);

    if (!providedRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = verifyRefreshToken(providedRefreshToken);
    if (!decoded?.userId) {
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = await User.findById(decoded.userId)
      .select('+refreshTokenHash +refreshTokenExpiresAt +password');

    if (!user || !user.isActive) {
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const providedHash = hashRefreshToken(providedRefreshToken);

    if (!user.refreshTokenHash || user.refreshTokenHash !== providedHash) {
      // Possible token reuse attack: revoke persisted refresh token state.
      await invalidateUserRefreshToken(user._id);
      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message: 'Refresh token reuse detected. Please login again.',
      });
    }

    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      await invalidateUserRefreshToken(user._id);
      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.',
      });
    }

    const newAccessToken = generateToken(user._id, user.email, user.role, {});
    const newRefreshToken = generateRefreshToken(user._id);
    const decodedNewRefresh = verifyRefreshToken(newRefreshToken);

    await saveUserRefreshToken(user._id, newRefreshToken, decodedNewRefresh);
    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, getRefreshCookieOptions());

    return res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newAccessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    clearRefreshCookie(res);

    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
    });
  }
};

export const logout = async (req, res) => {
  try {
    const providedRefreshToken = readRefreshTokenFromRequest(req);

    if (providedRefreshToken) {
      const decoded = verifyRefreshToken(providedRefreshToken);
      if (decoded?.userId) {
        await invalidateUserRefreshToken(decoded.userId);
      }
    }

    clearRefreshCookie(res);

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    clearRefreshCookie(res);

    return res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        photoURL: user.photoURL,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, photoURL } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone && { phone }),
        ...(photoURL && { photoURL }),
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create activity record
    await Activity.create({
      userId: user._id,
      type: 'profile_update',
      description: 'Profile updated',
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

