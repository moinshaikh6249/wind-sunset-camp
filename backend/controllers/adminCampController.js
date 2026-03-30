import {
  createCamp,
  getAllCamps,
  getCampById,
  updateCamp,
  deleteCamp,
} from './campController.js';

export const uploadCampImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error('Upload camp image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
};

export {
  createCamp,
  getAllCamps,
  getCampById,
  updateCamp,
  deleteCamp,
};
