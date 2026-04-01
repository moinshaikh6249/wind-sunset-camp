import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose__: MongooseCache | undefined;
}

const resolveMongoUri = () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) environment variable.');
  }
  return uri;
};

const cache = global.__mongoose__ || { conn: null, promise: null };
global.__mongoose__ = cache;

export async function connectMongoose() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const mongoUri = resolveMongoUri();
    cache.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
