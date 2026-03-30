import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
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
      index: true,
    },
    response: {
      text: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

messageSchema.index({ read: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
