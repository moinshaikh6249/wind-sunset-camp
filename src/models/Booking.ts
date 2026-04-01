import mongoose, { Schema, type Model } from 'mongoose';

export type BookingDocument = {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  campId: string;
  numberOfPeople: number;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
};

const bookingSchema = new Schema<BookingDocument>(
  {
    fullName: {
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    campId: {
      type: String,
      required: true,
      index: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<BookingDocument> =
  mongoose.models?.Booking || mongoose.model<BookingDocument>('Booking', bookingSchema);

export default Booking;
