const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'windcamp';
  if (!uri) {
    console.error('Missing MONGODB_URI/MONGO_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const campsCollection = process.env.MONGODB_CAMPS_COLLECTION || 'camps';
  const galleryCollection = process.env.MONGODB_GALLERY_COLLECTION || 'galleryImages';

  const campsResult = await db.collection(campsCollection).updateMany(
    {
      $or: [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: '' }],
      $or: [{ image: { $regex: '^https?://', $options: 'i' } }, { url: { $regex: '^https?://', $options: 'i' } }],
    },
    [
      {
        $set: {
          imageUrl: {
            $ifNull: ['$image', '$url'],
          },
        },
      },
    ]
  );

  const galleryResult = await db.collection(galleryCollection).updateMany(
    {
      $or: [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: '' }],
      $or: [{ image: { $regex: '^https?://', $options: 'i' } }, { url: { $regex: '^https?://', $options: 'i' } }],
    },
    [
      {
        $set: {
          imageUrl: {
            $ifNull: ['$image', '$url'],
          },
          image: {
            $ifNull: ['$image', '$url'],
          },
        },
      },
    ]
  );

  const memoriesResult = await db.collection('memories').updateMany(
    {
      $or: [{ imageUrl: { $exists: false } }, { imageUrl: null }, { imageUrl: '' }],
      image: { $regex: '^https?://', $options: 'i' },
    },
    [
      {
        $set: {
          imageUrl: '$image',
        },
      },
    ]
  );

  console.log(JSON.stringify({
    campsMatched: campsResult.matchedCount,
    campsModified: campsResult.modifiedCount,
    galleryMatched: galleryResult.matchedCount,
    galleryModified: galleryResult.modifiedCount,
    memoriesMatched: memoriesResult.matchedCount,
    memoriesModified: memoriesResult.modifiedCount,
  }, null, 2));

  await client.close();
})();
