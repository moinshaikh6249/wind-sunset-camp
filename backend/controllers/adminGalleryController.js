import cloudinary from '../config/cloudinary.js';
import GalleryImage from '../models/GalleryImage.js';
import mongoose from 'mongoose';

const buildImageHint = (description = '') => {
  const normalized = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

  return normalized || 'camp gallery image';
};

export const getGalleryImages = async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      images,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    const description = req.body?.description || '';

    const image = await GalleryImage.create({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      description,
      imageHint: buildImageHint(description),
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      image,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId, { resource_type: 'image' });
    }

    await GalleryImage.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};