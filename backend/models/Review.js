import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
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
      index: true,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ visible: 1, pinned: -1, createdAt: -1 });
reviewSchema.index({ rating: 1, visible: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
