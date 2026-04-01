import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Camp from '../models/Camp.js';
import logger from '../utils/logger.js';

dotenv.config();

const camps = [
  {
    name: 'Wind & Sunset Lakeside Retreat',
    slug: 'wind-sunset-lakeside-retreat',
    location: 'Pawna Lake, Maharashtra',
    price: 1200,
    capacity: 60,
    description: 'Lakeside camping with sunset views, bonfire, live acoustic music, and guided stargazing.',
    imageUrl: '/images/camp1.jpg',
    isActive: true,
  },
  {
    name: 'Sahyadri Adventure Basecamp',
    slug: 'sahyadri-adventure-basecamp',
    location: 'Lonavala Hills, Maharashtra',
    price: 1800,
    capacity: 45,
    description: 'Trekking-focused camp with early sunrise hikes, rope activities, and mountain breakfast.',
    imageUrl: '/images/camp2.jpg',
    isActive: true,
  },
  {
    name: 'Monsoon Valley Escape',
    slug: 'monsoon-valley-escape',
    location: 'Mulshi, Pune',
    price: 1500,
    capacity: 50,
    description: 'Monsoon-special weekend camp with valley viewpoints, rain trails, and hot local meals.',
    imageUrl: '/images/camp3.jpg',
    isActive: true,
  },
  {
    name: 'Forest Trail Explorer Camp',
    slug: 'forest-trail-explorer-camp',
    location: 'Bhor, Pune',
    price: 1400,
    capacity: 40,
    description: 'A nature camp featuring forest walks, birdwatching sessions, and eco-learning activities.',
    imageUrl: '/images/camp4.jpg',
    isActive: true,
  },
  {
    name: 'Weekend Family Fun Camp',
    slug: 'weekend-family-fun-camp',
    location: 'Kamshet, Maharashtra',
    price: 1000,
    capacity: 80,
    description: 'Family-friendly campsite with games, storytelling circles, and beginner-friendly activities.',
    imageUrl: '/images/camp5.jpg',
    isActive: true,
  },
  {
    name: 'Riverside Chill Camp',
    slug: 'riverside-chill-camp',
    location: 'Kolad, Maharashtra',
    price: 1600,
    capacity: 35,
    description: 'Relaxed riverside stay with kayaking options, campfire BBQ, and cozy tent stays.',
    imageUrl: '/images/camp6.jpg',
    isActive: true,
  },
  {
    name: 'Sunrise Peak Camp',
    slug: 'sunrise-peak-camp',
    location: 'Rajmachi, Maharashtra',
    price: 2000,
    capacity: 30,
    description: 'High-altitude camp designed for trekkers with panoramic dawn views and summit trails.',
    imageUrl: '/images/camp7.jpg',
    isActive: true,
  },
  {
    name: 'Stargazer Night Camp',
    slug: 'stargazer-night-camp',
    location: 'Malshej Ghat, Maharashtra',
    price: 1700,
    capacity: 40,
    description: 'Night-sky themed camp with telescope sessions, astro-talks, and midnight hot beverages.',
    imageUrl: '/images/camp8.jpg',
    isActive: true,
  },
];

const seedCamps = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Seeding is disabled without a development database URI.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  logger.info('[seed:camps] Connected to DB', { dbName: mongoose.connection.name });

  await Camp.deleteMany({});
  const inserted = await Camp.insertMany(camps);

  logger.info('[seed:camps] Inserted camps', { count: inserted.length });
  await mongoose.connection.close();
  logger.info('[seed:camps] Done');
};

seedCamps().catch(async (error) => {
  logger.error('[seed:camps] Failed', { error: error.message });
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
