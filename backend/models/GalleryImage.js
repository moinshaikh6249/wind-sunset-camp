import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: null,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageHint: {
      type: String,
      required: true,
      lowercase: true,
    },
    title: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['camp', 'activity', 'facility', 'nature', 'review', 'other'],
      default: 'camp',
      index: true,
    },
    width: Number,
    height: Number,
    size: Number,
    mimeType: String,
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
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
  },
  { timestamps: true }
);

galleryImageSchema.index({ isPublic: 1, order: 1 });
galleryImageSchema.index({ category: 1, featured: 1 });

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

export default GalleryImage;
