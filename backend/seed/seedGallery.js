import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GalleryImage from '../models/GalleryImage.js';
import logger from '../utils/logger.js';

dotenv.config();

const galleryImages = [
  { imageUrl: '/images/gallery1.jpg', description: 'Golden hour view over tents by the lake.', imageHint: 'sunset lake tents' },
  { imageUrl: '/images/gallery2.jpg', description: 'Campfire circle with guests enjoying live music.', imageHint: 'campfire music night' },
  { imageUrl: '/images/gallery3.jpg', description: 'Morning trek group starting from the basecamp.', imageHint: 'morning trek group' },
  { imageUrl: '/images/gallery4.jpg', description: 'Cozy tent interiors prepared for weekend guests.', imageHint: 'tent interior cozy' },
  { imageUrl: '/images/gallery5.jpg', description: 'Bonfire barbecue setup near the riverside.', imageHint: 'barbecue riverside bonfire' },
  { imageUrl: '/images/gallery6.jpg', description: 'Kayaking activity session during camp adventure.', imageHint: 'kayaking camp adventure' },
  { imageUrl: '/images/gallery7.jpg', description: 'Families participating in outdoor team games.', imageHint: 'family outdoor games' },
  { imageUrl: '/images/gallery8.jpg', description: 'Stargazing setup with telescope at night.', imageHint: 'stargazing telescope night' },
  { imageUrl: '/images/gallery9.jpg', description: 'Breakfast corner with mountain valley backdrop.', imageHint: 'breakfast valley mountain' },
  { imageUrl: '/images/gallery10.jpg', description: 'Rain trail walk during monsoon special camp.', imageHint: 'rain trail monsoon' },
  { imageUrl: '/images/gallery11.jpg', description: 'Forest nature walk guided by camp staff.', imageHint: 'forest nature walk' },
  { imageUrl: '/images/gallery12.jpg', description: 'Group photo before checkout at campsite.', imageHint: 'group photo campsite' },
];

const seedGallery = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Seeding is disabled without a development database URI.');
  }

  await mongoose.connect(process.env.MONGO_URI);
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
