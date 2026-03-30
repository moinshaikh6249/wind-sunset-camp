import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['signup', 'booking', 'review', 'login', 'profile_update'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      bookingId: mongoose.Schema.Types.ObjectId,
      campId: mongoose.Schema.Types.ObjectId,
      reviewId: mongoose.Schema.Types.ObjectId,
      ipAddress: String,
      userAgent: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

activitySchema.index({ userId: 1, timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
