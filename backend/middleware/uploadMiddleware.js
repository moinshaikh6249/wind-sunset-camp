import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const resolveFolder = (req) => {
  if (req.uploadFolder === 'memories') {
    return 'wind_sunset_memories';
  }

  if (req.uploadFolder === 'admin-gallery') {
    return 'camp-gallery';
  }

  if (req.uploadFolder === 'gallery') {
    return 'wind_sunset_gallery';
  }

  return 'wind_sunset_camps';
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: resolveFolder(req),
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`,
  }),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const useCampUploadFolder = (req, res, next) => {
  req.uploadFolder = 'camp';
  next();
};

export const useGalleryUploadFolder = (req, res, next) => {
  req.uploadFolder = 'gallery';
  next();
};

export const useAdminGalleryUploadFolder = (req, res, next) => {
  req.uploadFolder = 'admin-gallery';
  next();
};

export const useMemoriesUploadFolder = (req, res, next) => {
  req.uploadFolder = 'memories';
  next();
};

const withUploadErrorHandling = (uploader) => (req, res, next) => {
  uploader(req, res, (error) => {
    if (error) {
      const message =
        error?.message ||
        error?.error?.message ||
        error?.cause?.message ||
        'Image upload failed';

      return res.status(400).json({
        success: false,
        message,
        data: null,
      });
    }

    return next();
  });
};

export const uploadCampImage = withUploadErrorHandling(upload.single('image'));
export const uploadAdminGalleryImage = withUploadErrorHandling(upload.single('image'));
export const uploadMemoryImage = withUploadErrorHandling(upload.single('image'));
export const uploadGalleryImages = withUploadErrorHandling(upload.array('images', 10));

export default upload;
