import mongoose, { Schema, type Model } from 'mongoose';

export type MemoryDocument = {
  _id: mongoose.Types.ObjectId;
  image: string;
  imageUrl?: string;
  title: string;
  caption?: string;
  user?: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    email?: string;
  };
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
};

const memorySchema = new Schema<MemoryDocument>(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
  },
  { timestamps: true }
);

memorySchema.index({ createdAt: -1 });

const Memory: Model<MemoryDocument> =
  (mongoose.models.Memory as Model<MemoryDocument>) ||
  mongoose.model<MemoryDocument>('Memory', memorySchema);

export default Memory;
