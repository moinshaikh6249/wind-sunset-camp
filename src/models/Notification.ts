import mongoose, { Schema, type Model } from 'mongoose';

export type NotificationDocument = {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'new_booking_created' | 'new_user_message' | 'new_review_submitted' | 'pending_booking_approval' | 'booking_cancelled' | 'payment_received';
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const notificationSchema = new Schema<NotificationDocument>(
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
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1, isRead: 1 });

const Notification: Model<NotificationDocument> =
  mongoose.models?.Notification || mongoose.model<NotificationDocument>('Notification', notificationSchema);

export default Notification;
