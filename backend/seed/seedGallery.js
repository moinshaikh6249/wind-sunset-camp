import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GalleryImage from '../models/GalleryImage.js';
import connectDB from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const galleryImages = [
  { imageUrl: '/images/gallery1.jpg', description: 'Golden hour view over tents by the lake.', imageHint: 'sunset lake tents', category: 'camp', isPublic: true },
  { imageUrl: '/images/gallery2.jpg', description: 'Campfire circle with guests enjoying live music.', imageHint: 'campfire music night', category: 'activity', isPublic: true },
  { imageUrl: '/images/gallery3.jpg', description: 'Morning trek group starting from the basecamp.', imageHint: 'morning trek group', category: 'activity', isPublic: true },
  { imageUrl: '/images/gallery4.jpg', description: 'Cozy tent interiors prepared for weekend guests.', imageHint: 'tent interior cozy', category: 'facility', isPublic: true },
  { imageUrl: '/images/gallery5.jpg', description: 'Bonfire barbecue setup near the riverside.', imageHint: 'barbecue riverside bonfire', category: 'facility', isPublic: true },
  { imageUrl: '/images/gallery6.jpg', description: 'Kayaking activity session during camp adventure.', imageHint: 'kayaking camp adventure', category: 'activity', isPublic: true },
  { imageUrl: '/images/gallery7.jpg', description: 'Families participating in outdoor team games.', imageHint: 'family outdoor games', category: 'activity', isPublic: true },
  { imageUrl: '/images/gallery8.jpg', description: 'Stargazing setup with telescope at night.', imageHint: 'stargazing telescope night', category: 'nature', isPublic: true },
  { imageUrl: '/images/gallery9.jpg', description: 'Breakfast corner with mountain valley backdrop.', imageHint: 'breakfast valley mountain', category: 'facility', isPublic: true },
  { imageUrl: '/images/gallery10.jpg', description: 'Rain trail walk during monsoon special camp.', imageHint: 'rain trail monsoon', category: 'nature', isPublic: true },
  { imageUrl: '/images/gallery11.jpg', description: 'Forest nature walk guided by camp staff.', imageHint: 'forest nature walk', category: 'nature', isPublic: true },
  { imageUrl: '/images/gallery12.jpg', description: 'Group photo before checkout at campsite.', imageHint: 'group photo campsite', category: 'camp', isPublic: true },
];

const seedGallery = async () => {
  const conn = await connectDB();
  if (!conn) {
    throw new Error('Failed to connect to database for gallery seeding');
  }

  logger.info('[seed:gallery] Connected to DB', { dbName: mongoose.connection.name });

  await GalleryImage.deleteMany({});
  const inserted = await GalleryImage.insertMany(galleryImages);

  logger.info('[seed:gallery] Inserted gallery images', { count: inserted.length });
  await mongoose.connection.close();
  logger.info('[seed:gallery] Done');
};

seedGallery().catch(async (error) => {
  logger.error('[seed:gallery] Failed', { error: error.message });
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
