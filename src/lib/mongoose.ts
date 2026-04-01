import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: Promise<typeof mongoose> | undefined;
}

const resolveMongoUri = () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) environment variable.');
  }
  return uri;
};

export async function connectMongoose() {
  if (!global._mongoose) {
    const MONGODB_URI = resolveMongoUri();
    global._mongoose = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  return global._mongoose;
}
