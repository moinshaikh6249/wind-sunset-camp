import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import logger from './logger.js';

const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Moin Shaikh';
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'moinshaikh6249@gmail.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || '123321123';

export async function createDefaultAdmin() {
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    logger.warn('Default admin creation skipped: missing admin credentials');
    return;
  }

  const existingAdminCount = await Admin.countDocuments();
  if (existingAdminCount > 0) {
    logger.info('Admin bootstrap skipped because an admin account already exists');
    return;
  }

  const existingAdmin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });
  if (existingAdmin) {
    logger.info('Default admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  await Admin.create({
    name: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  logger.info('Default admin created', { email: DEFAULT_ADMIN_EMAIL });
}
