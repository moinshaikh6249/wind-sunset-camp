import mongoose, { Schema, type Model } from 'mongoose';

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) || mongoose.model<UserDocument>('User', userSchema);

export default User;
