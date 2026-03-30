import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import Activity from '../models/Activity.js';

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
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

    // Create activity record
    await Activity.create({
      userId: user._id,
      type: 'login',
      description: 'User logged in',
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const token = generateToken(user._id, user.email, user.role, {});
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
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

