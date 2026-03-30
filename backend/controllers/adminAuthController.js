import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../utils/jwt.js';

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const inputPassword = password;
    let isValidPassword = false;

    if (typeof admin.password === 'string' && admin.password.startsWith('$2b$')) {
      isValidPassword = await bcrypt.compare(inputPassword, admin.password);
    } else {
      isValidPassword = inputPassword === admin.password;
    }

    console.log('Input password:', inputPassword);
    console.log('DB password:', admin.password);
    console.log('Match:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
    return res.status(500).json({ message: 'Server error' });
  }
};

export const adminLogin = loginAdmin;
