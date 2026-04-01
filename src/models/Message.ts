import mongoose, { Schema, type Model } from 'mongoose';

export type MessageDocument = {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: 'booking' | 'inquiry' | 'feedback' | 'support' | 'other';
  read?: boolean;
  archived?: boolean;
  response?: {
    text?: string;
    respondedAt?: Date;
    respondedBy?: mongoose.Types.ObjectId;
  };
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const messageSchema = new Schema<MessageDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['booking', 'inquiry', 'feedback', 'support', 'other'],
      default: 'inquiry',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    response: {
      text: String,
      respondedAt: Date,
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

messageSchema.index({ read: 1, timestamp: -1 });

const Message: Model<MessageDocument> =
  mongoose.models?.Message || mongoose.model<MessageDocument>('Message', messageSchema);

export default Message;
