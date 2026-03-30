import mongoose from 'mongoose';

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    activities: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: null,
      trim: true,
    },
    capacity: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'camps',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

campSchema.index({ date: 1, location: 1 });
campSchema.index({ featured: 1, status: 1, date: 1 });
campSchema.index({ slug: 1 }, { unique: true });

const Camp = mongoose.model('Camp', campSchema);

export default Camp;