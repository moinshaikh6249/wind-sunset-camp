import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
      index: true,
    },
    campName: {
      type: String,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      default: null,
    },
    specialRequests: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash'],
      default: 'cash',
      trim: true,
      index: true,
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
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
