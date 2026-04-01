import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';
import logger from '../utils/logger.js';

dotenv.config();

const reviews = [
  { name: 'Aarav Mehta', rating: 5, comment: 'Amazing camp vibe, excellent staff support, and memorable bonfire sessions.', createdAt: new Date('2026-01-05T18:30:00Z') },
  { name: 'Ishita Kulkarni', rating: 4, comment: 'Great location and food quality, especially enjoyed the early morning hike.', createdAt: new Date('2026-01-12T08:20:00Z') },
  { name: 'Rohan Patil', rating: 5, comment: 'Very well organized itinerary with fun activities and clean camping facilities.', createdAt: new Date('2026-01-20T12:15:00Z') },
  { name: 'Sneha Joshi', rating: 4, comment: 'Loved the lakeside stay and music night; booking process was very smooth too.', createdAt: new Date('2026-01-28T20:40:00Z') },
  { name: 'Kunal Deshmukh', rating: 5, comment: 'Perfect weekend getaway with trekking, campfire, and peaceful night sky views.', createdAt: new Date('2026-02-03T14:50:00Z') },
  { name: 'Priya Nair', rating: 4, comment: 'Friendly team and good safety arrangements; family had a really good time.', createdAt: new Date('2026-02-10T10:30:00Z') },
  { name: 'Aditya Rao', rating: 5, comment: 'Clean tents, tasty meals, and excellent coordination from check-in to checkout.', createdAt: new Date('2026-02-16T17:25:00Z') },
  { name: 'Neha Shah', rating: 4, comment: 'Scenic views were stunning and activities were engaging throughout the trip.', createdAt: new Date('2026-02-22T09:10:00Z') },
  { name: 'Vikram Singh', rating: 5, comment: 'One of the best camp experiences so far with a great community atmosphere.', createdAt: new Date('2026-03-01T16:45:00Z') },
  { name: 'Mira Fernandes', rating: 4, comment: 'Wonderful weekend experience with balanced adventure and relaxing downtime.', createdAt: new Date('2026-03-08T11:35:00Z') },
];

const seedReviews = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Seeding is disabled without a development database URI.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  logger.info('[seed:reviews] Connected to DB', { dbName: mongoose.connection.name });

  await Review.deleteMany({});
  const inserted = await Review.insertMany(reviews);

  logger.info('[seed:reviews] Inserted reviews', { count: inserted.length });
  await mongoose.connection.close();
  logger.info('[seed:reviews] Done');
};

seedReviews().catch(async (error) => {
  logger.error('[seed:reviews] Failed', { error: error.message });
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
