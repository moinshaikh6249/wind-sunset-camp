import mongoose, { Schema, type Model } from 'mongoose';

export type ReviewDocument = {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  campId?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  visible?: boolean;
  pinned?: boolean;
  helpful?: number;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const reviewSchema = new Schema<ReviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
    },
    visible: {
      type: Boolean,
      default: true,
      index: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ visible: 1, pinned: -1, createdAt: -1 });
reviewSchema.index({ rating: 1, visible: 1 });

const Review: Model<ReviewDocument> =
  mongoose.models?.Review || mongoose.model<ReviewDocument>('Review', reviewSchema);

export default Review;
