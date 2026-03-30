import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    camp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    publicId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    collection: 'memories',
    timestamps: true,
  }
);

memorySchema.index({ status: 1, createdAt: -1 });
memorySchema.index({ user: 1, createdAt: -1 });

const Memory = mongoose.models.Memory || mongoose.model('Memory', memorySchema);

export default Memory;
