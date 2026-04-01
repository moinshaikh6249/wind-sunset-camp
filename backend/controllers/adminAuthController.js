import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt.js';
import logger from '../utils/logger.js';

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    const passwordHash = typeof admin.password === 'string' ? admin.password.trim() : '';

    if (!passwordHash || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)) {
      logger.warn('Admin login blocked due to missing password hash', {
        email: normalizedEmail,
        adminId: String(admin._id),
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    let isValidPassword = false;

    try {
      isValidPassword = await bcrypt.compare(password, passwordHash);
    } catch (compareError) {
      logger.warn('Admin login blocked due to invalid password hash comparison', {
        email: normalizedEmail,
        adminId: String(admin._id),
        error: compareError.message,
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        id: admin._id,
        role: 'admin',
        email: admin.email,
      },
      process.env.JWT_SECRET || getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    logger.error('Admin login failed due to server-side error', {
      email: String(req.body?.email || '').trim().toLowerCase() || undefined,
      error: error.message,
    });
    return res.status(500).json({
      success: false,
      message: 'Unable to complete login. Please try again.',
    });
  }
};

export const adminLogin = loginAdmin;
