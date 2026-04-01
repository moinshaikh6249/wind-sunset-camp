import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const id = decoded?.id || decoded?.userId || decoded?.adminId;
    const role = decoded?.role;

    if (!id || !role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    req.user = {
      ...decoded,
      id,
      role,
      userId: id,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

export const requireUserRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. User privileges required.',
    });
  }

  next();
};

export const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

export default authMiddleware;
