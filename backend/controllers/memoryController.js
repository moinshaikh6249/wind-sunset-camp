import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Memory from '../models/Memory.js';
import Camp from '../models/Camp.js';

const isAbsoluteUrl = (value = '') => /^https?:\/\//i.test(String(value));

const resolvePublicImageUrl = (value, req) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (isAbsoluteUrl(raw)) return raw;

  const origin = `${req.protocol}://${req.get('host')}`;
  if (raw.startsWith('/')) {
    return `${origin}${raw}`;
  }

  return `${origin}/uploads/${raw}`;
};

const formatMemory = (memory, req) => {
  const user = memory.user && typeof memory.user === 'object' ? memory.user : null;
  const fallbackName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  return {
    id: memory._id,
    imageUrl: resolvePublicImageUrl(memory.imageUrl, req),
    caption: memory.caption,
    user: {
      name: user?.name || fallbackName || 'Anonymous Camper',
    },
    createdAt: memory.createdAt,
    status: memory.status,
    camp: memory.camp || null,
  };
};

const getUserIdFromRequest = (req) => req.user?.id || null;
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || '').trim());

export const createMemory = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    const caption = req.body?.caption || '';
    const campId = req.body?.camp || null;

    let camp = null;
    if (campId) {
      if (!mongoose.Types.ObjectId.isValid(campId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid camp id',
        });
      }

      camp = await Camp.findById(campId).select('_id');
      if (!camp) {
        return res.status(404).json({
          success: false,
          message: 'Camp not found',
        });
      }
    }

    const memory = await Memory.create({
      imageUrl: req.file.path,
      caption,
      user: userId,
      camp: camp?._id || null,
      status: 'pending',
      publicId: req.file.filename,
    });

    await memory.populate('user', 'name firstName lastName');

    return res.status(201).json({
      success: true,
      message: 'Memory uploaded successfully and sent for approval',
      memory: formatMemory(memory, req),
    });
  } catch (error) {
    console.error('Create memory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload memory',
    });
  }
};

export const getApprovedMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ status: 'approved' })
      .populate('user', 'name firstName lastName')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      memories: memories.map((memory) => formatMemory(memory, req)),
    });
  } catch (error) {
    console.error('Get approved memories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch memories',
    });
  }
};

export const getMyMemories = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const memories = await Memory.find({ user: userId })
      .populate('user', 'name firstName lastName')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      memories: memories.map((memory) => formatMemory(memory, req)),
    });
  } catch (error) {
    console.error('Get my memories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your memories',
    });
  }
};

export const deleteMyMemory = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    if (String(memory.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own memory',
      });
    }

    if (memory.publicId) {
      await cloudinary.uploader.destroy(memory.publicId, { resource_type: 'image' });
    }

    await Memory.findByIdAndDelete(memory._id);

    return res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    console.error('Delete my memory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete memory',
    });
  }
};

export const getAllMemoriesAdmin = async (req, res) => {
  try {
    const memories = await Memory.find()
      .populate('user', 'name firstName lastName')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      memories: memories.map((memory) => formatMemory(memory, req)),
    });
  } catch (error) {
    console.error('Get all memories admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch memories',
    });
  }
};

export const approveMemory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name firstName lastName');

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    return res.json({
      success: true,
      message: 'Memory approved successfully',
      memory: formatMemory(memory, req),
    });
  } catch (error) {
    console.error('Approve memory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve memory',
    });
  }
};

export const rejectMemory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name firstName lastName');

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    return res.json({
      success: true,
      message: 'Memory rejected successfully',
      memory: formatMemory(memory, req),
    });
  } catch (error) {
    console.error('Reject memory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject memory',
    });
  }
};

export const deleteMemoryAdmin = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found',
      });
    }

    if (memory.publicId) {
      await cloudinary.uploader.destroy(memory.publicId, { resource_type: 'image' });
    }

    await Memory.findByIdAndDelete(memory._id);

    return res.json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    console.error('Delete memory admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete memory',
    });
  }
};
