import cloudinary from '../config/cloudinary.js';
import CustomerMemory from '../models/CustomerMemory.js';

export const getMemories = async (req, res) => {
  try {
    const memories = await CustomerMemory.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      memories,
    });
  } catch (error) {
    console.error('Get memories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer memories',
      error: error.message,
    });
  }
};

export const createMemory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    const caption = req.body?.caption || '';

    const memory = await CustomerMemory.create({
      imageUrl: req.file.path,
      caption,
      uploadedBy: req.user?.id || req.user?.adminId || null,
      publicId: req.file.filename,
    });

    return res.status(201).json({
      success: true,
      memory,
    });
  } catch (error) {
    console.error('Create memory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create customer memory',
      error: error.message,
    });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const memory = await CustomerMemory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    if (memory.publicId) {
      await cloudinary.uploader.destroy(memory.publicId, { resource_type: 'image' });
    }

    await CustomerMemory.findByIdAndDelete(memory._id);

    return res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    console.error('Delete memory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete customer memory',
      error: error.message,
    });
  }
};
