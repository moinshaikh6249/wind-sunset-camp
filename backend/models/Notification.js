import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['new_booking_created', 'new_user_message', 'new_review_submitted', 'pending_booking_approval', 'booking_cancelled', 'payment_received'],
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  }
);

notificationSchema.index({ createdAt: -1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
