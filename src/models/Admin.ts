import mongoose, { Schema, type Model } from 'mongoose';

export type AdminDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role?: 'admin';
  createdAt?: Date;
  updatedAt?: Date;
};

const adminSchema = new Schema<AdminDocument>(
  {
    name: {
      type: String,
      required: true,
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
      default: 'admin',
    },
  },
  { timestamps: true, collection: 'admins' }
);

const Admin: Model<AdminDocument> =
  (mongoose.models.Admin as Model<AdminDocument>) || mongoose.model<AdminDocument>('Admin', adminSchema);

export default Admin;
