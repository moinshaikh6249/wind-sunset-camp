import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Camp from '../models/Camp.js';
import GalleryImage from '../models/GalleryImage.js';

dotenv.config();

const PLACEHOLDER_IMAGE_URL =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470';

const isMissingImageQuery = {
  $or: [
    { imageUrl: { $exists: false } },
    { imageUrl: null },
    { imageUrl: '' },
  ],
};

const migrate = async () => {
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    throw new Error('MONGO_URI or MONGODB_URI is required');
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);

  const campsToFix = await Camp.find(isMissingImageQuery).select('_id imageUrl').lean();
  const galleryToFix = await GalleryImage.find(isMissingImageQuery).select('_id imageUrl description').lean();

  let updatedCamps = 0;
  for (const camp of campsToFix) {
    await Camp.updateOne(
      { _id: camp._id },
      {
        $set: {
          imageUrl: PLACEHOLDER_IMAGE_URL,
        },
      }
    );
    updatedCamps += 1;
  }

  let updatedGallery = 0;
  for (const image of galleryToFix) {
    await GalleryImage.updateOne(
      { _id: image._id },
      {
        $set: {
          imageUrl: PLACEHOLDER_IMAGE_URL,
          ...(image.description ? {} : { description: 'Gallery image' }),
        },
      }
    );
    updatedGallery += 1;
  }

  console.log(`[migrate:images] Camps updated: ${updatedCamps}`);
  console.log(`[migrate:images] Gallery images updated: ${updatedGallery}`);

  await mongoose.connection.close();
};

migrate().catch(async (error) => {
  console.error('[migrate:images] Failed:', error.message);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
