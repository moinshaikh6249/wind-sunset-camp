import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from '../utils/logger.js';

dotenv.config();

const rawUsers = [
  { name: 'Aarav Mehta', email: 'aarav.demo@example.com', password: 'DemoPass@123', role: 'user' },
  { name: 'Ishita Kulkarni', email: 'ishita.demo@example.com', password: 'DemoPass@123', role: 'user' },
  { name: 'Rohan Patil', email: 'rohan.demo@example.com', password: 'DemoPass@123', role: 'admin' },
  { name: 'Sneha Joshi', email: 'sneha.demo@example.com', password: 'DemoPass@123', role: 'user' },
  { name: 'Vikram Singh', email: 'vikram.demo@example.com', password: 'DemoPass@123', role: 'admin' },
];

const splitName = (name) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || 'Demo';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

const seedUsers = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Seeding is disabled without a development database URI.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  logger.info('[seed:users] Connected to DB', { dbName: mongoose.connection.name });

  const users = await Promise.all(
    rawUsers.map(async (entry) => {
      const { firstName, lastName } = splitName(entry.name);
      const hashedPassword = await bcrypt.hash(entry.password, 10);
      return {
        firstName,
        lastName,
        email: entry.email.toLowerCase(),
        password: hashedPassword,
        role: entry.role,
      };
    })
  );

  await User.deleteMany({ email: { $in: users.map((u) => u.email) } });
  const inserted = await User.insertMany(users);

  logger.info('[seed:users] Inserted users', { count: inserted.length });
  await mongoose.connection.close();
  logger.info('[seed:users] Done');
};

seedUsers().catch(async (error) => {
  logger.error('[seed:users] Failed', { error: error.message });
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
