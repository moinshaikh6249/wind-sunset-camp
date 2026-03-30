import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const devJwtSecret = `dev-jwt-${randomBytes(32).toString('hex')}`;
const devRefreshSecret = `dev-refresh-${randomBytes(32).toString('hex')}`;

export const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  return devJwtSecret;
};

export const getJwtRefreshSecret = () => {
  if (process.env.JWT_REFRESH_SECRET) {
    return process.env.JWT_REFRESH_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET is required in production');
  }

  return devRefreshSecret;
};

export const generateToken = (userId, email, role, permissions) => {
  return jwt.sign(
    {
      userId,
      id: userId,
      email,
      role,
      permissions,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    getJwtRefreshSecret(),
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getJwtRefreshSecret());
  } catch (error) {
    return null;
  }
};

