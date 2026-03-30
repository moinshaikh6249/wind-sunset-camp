import GalleryImage from '../models/GalleryImage.js';

export const getAllGalleryImages = async (req, res) => {
  try {
    const { featured, category, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const query = { isPublic: true };
    if (featured === 'true') {
      query.featured = true;
    }
    if (category) {
      query.category = category;
    }

    const images = await GalleryImage.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GalleryImage.countDocuments(query);

    res.json({
      success: true,
      images,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: error.message,
    });
  }
};

export const createGalleryImage = async (req, res) => {
  try {
    const { imageUrl, description, imageHint, title, category, featured } = req.body;

    if (!imageUrl || !description || !imageHint) {
      return res.status(400).json({
        success: false,
        message: 'Image URL, description, and hint are required',
      });
    }

    const image = new GalleryImage({
      imageUrl,
      description,
      imageHint,
      ...(title && { title }),
      category: category || 'camp',
      uploadedBy: req.user?.userId || null,
      ...(featured && { featured }),
    });

    await image.save();

    res.status(201).json({
      success: true,
      message: 'Gallery image added successfully',
      image,
    });
  } catch (error) {
    console.error('Create gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add gallery image',
      error: error.message,
    });
  }
};

export const getGalleryImageById = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id).populate('uploadedBy', 'firstName lastName email');

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found',
      });
    }

    res.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error('Get gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery image',
      error: error.message,
    });
  }
};

export const updateGalleryImage = async (req, res) => {
  try {
    const { description, title, category, featured, isPublic, order } = req.body;

    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      {
        ...(description && { description }),
        ...(title && { title }),
        ...(category && { category }),
        ...(featured !== undefined && { featured }),
        ...(isPublic !== undefined && { isPublic }),
        ...(order !== undefined && { order }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found',
      });
    }

    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      image,
    });
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery image',
      error: error.message,
    });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found',
      });
    }

    res.json({
      success: true,
      message: 'Gallery image deleted successfully',
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery image',
      error: error.message,
    });
  }
};

