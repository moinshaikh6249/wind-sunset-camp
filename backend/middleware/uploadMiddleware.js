import multer from 'multer';
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

const storage = multer.memoryStorage();

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
    fileSize: 4 * 1024 * 1024,
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

const uploadBufferToCloudinary = (fileBuffer, req, file) => {
  return new Promise((resolve, reject) => {
    const folder = resolveFolder(req);
    const cleanFileName = (file.originalname || 'image').replace(/\s+/g, '-').toLowerCase().replace(/\.[^/.]+$/, '');
    const publicId = `${Date.now()}-${cleanFileName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const withUploadErrorHandling = (uploader) => (req, res, next) => {
  uploader(req, res, async (error) => {
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

    try {
      if (req.file && req.file.buffer) {
        const result = await uploadBufferToCloudinary(req.file.buffer, req, req.file);
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;
        req.file.secure_url = result.secure_url;
        req.file.public_id = result.public_id;
      }

      if (Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
          if (file.buffer) {
            const result = await uploadBufferToCloudinary(file.buffer, req, file);
            file.path = result.secure_url;
            file.filename = result.public_id;
            file.secure_url = result.secure_url;
            file.public_id = result.public_id;
          }
        }
      }

      return next();
    } catch (uploadError) {
      const message =
        uploadError?.message ||
        uploadError?.error?.message ||
        'Failed to upload image to Cloudinary';

      return res.status(400).json({
        success: false,
        message,
        data: null,
      });
    }
  });
};

export const uploadCampImage = withUploadErrorHandling(upload.single('image'));
export const uploadAdminGalleryImage = withUploadErrorHandling(upload.single('image'));
export const uploadMemoryImage = withUploadErrorHandling(upload.single('image'));
export const uploadGalleryImages = withUploadErrorHandling(upload.array('images', 10));

export default upload;
