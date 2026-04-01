import mongoose from 'mongoose';
import Camp from '../models/Camp.js';
import logger from '../utils/logger.js';

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

const mapCampResponse = (camp, req) => {
  if (!camp) return camp;
  const plain = typeof camp.toObject === 'function' ? camp.toObject() : camp;
  return {
    ...plain,
    imageUrl: resolvePublicImageUrl(plain.imageUrl, req),
  };
};

const normalizeActivities = (activities) => {
  if (Array.isArray(activities)) {
    return activities.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }

  if (typeof activities === 'string') {
    return activities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseCampDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toSlug = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const normalizeStatus = (value) => {
  if (typeof value !== 'string') return 'active';
  const normalized = value.toLowerCase().trim();
  return normalized === 'inactive' ? 'inactive' : 'active';
};

const normalizeFeatured = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase().trim() === 'true';
  return false;
};

const resolveImageUrl = (req) => {
  if (req.file?.path) {
    return String(req.file.path).trim();
  }

  if (req.body.imageUrl === undefined || req.body.imageUrl === null) {
    return '';
  }

  return String(req.body.imageUrl).trim();
};

const validateCampPayload = (payload, { requireAll = false, hasImageFile = false, allowEmptyImage = false } = {}) => {
  const errors = [];

  const hasName = payload.name !== undefined;
  const hasDate = payload.date !== undefined;
  const hasLocation = payload.location !== undefined;
  const hasPrice = payload.price !== undefined;
  const hasStatus = payload.status !== undefined;

  if ((requireAll || hasName) && (!payload.name || !String(payload.name).trim())) {
    errors.push('name is required');
  }

  if (requireAll || hasDate) {
    const parsedDate = parseCampDate(payload.date);
    if (!parsedDate) {
      errors.push('date is required and must be a valid date');
    }
  }

  if ((requireAll || hasLocation) && (!payload.location || !String(payload.location).trim())) {
    errors.push('location is required');
  }

  if (requireAll || hasPrice) {
    const parsedPrice = Number(payload.price);
    if (Number.isNaN(parsedPrice)) {
      errors.push('price is required and must be a number');
    } else if (parsedPrice < 0) {
      errors.push('price must be greater than or equal to 0');
    }
  }

  if (requireAll || hasStatus) {
    const status = typeof payload.status === 'string' ? payload.status.toLowerCase().trim() : '';
    if (status && status !== 'active' && status !== 'inactive') {
      errors.push('status must be either active or inactive');
    }
  }

  const hasImageField = payload.imageUrl !== undefined;
  const imageUrl = typeof payload.imageUrl === 'string' ? payload.imageUrl.trim() : '';

  if ((requireAll || hasImageField) && !allowEmptyImage && !hasImageFile && !imageUrl) {
    errors.push('Please upload an image or provide an image URL');
  }

  return errors;
};

export const getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1, createdAt: -1 });

    res.json({
      success: true,
      camps: camps.map((camp) => mapCampResponse(camp, req)),
    });
  } catch (error) {
    console.error('Get camps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch camps',
    });
  }
};

export const searchCamps = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, date } = req.query;
    const filter = {
      status: 'active',
    };

    if (location) {
      filter.location = {
        $regex: String(location).trim(),
        $options: 'i',
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (date) {
      const parsedDate = parseCampDate(date);

      if (!parsedDate) {
        return res.status(400).json({
          success: false,
          message: 'date must be a valid date',
        });
      }

      parsedDate.setHours(0, 0, 0, 0);
      filter.date = {
        $gte: parsedDate,
      };
    }

    const camps = await Camp.find(filter).sort({ date: 1, createdAt: -1 });

    res.json({
      success: true,
      camps: camps.map((camp) => mapCampResponse(camp, req)),
    });
  } catch (error) {
    console.error('Search camps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search camps',
    });
  }
};

export const getUpcomingCamps = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const camps = await Camp.find({
      date: { $gte: today },
      status: 'active',
    }).sort({ date: 1 });

    res.json(camps.map((camp) => mapCampResponse(camp, req)));
  } catch (error) {
    console.error('Get upcoming camps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming camps',
    });
  }
};

export const getFeaturedCamps = async (req, res) => {
  try {
    const camps = await Camp.find({
      featured: true,
      status: 'active',
    })
      .sort({ date: 1, createdAt: -1 })
      .limit(3);

    res.json(camps.map((camp) => mapCampResponse(camp, req)));
  } catch (error) {
    console.error('Get featured camps error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured camps',
    });
  }
};

export const getCampById = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid camp id',
      });
    }

    const camp = await Camp.findById(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
      });
    }

    res.json({
      success: true,
      camp: mapCampResponse(camp, req),
    });
  } catch (error) {
    console.error('Get camp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch camp',
    });
  }
};

export const createCamp = async (req, res) => {
  try {
    logger.info('Creating camp', {
      hasFileUpload: Boolean(req.file),
      name: req.body?.name,
      location: req.body?.location,
    });

    const errors = validateCampPayload(req.body, {
      requireAll: true,
      hasImageFile: Boolean(req.file),
    });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { name, date, location, price, description, activities, status, featured } = req.body;
    const parsedDate = parseCampDate(date);
    const slugBase = toSlug(name);
    const slug = `${slugBase || 'camp'}-${Date.now()}`;
    const imageUrl = resolveImageUrl(req);

    const camp = new Camp({
      name: String(name).trim(),
      slug,
      date: parsedDate,
      location: String(location).trim(),
      price: Number(price),
      description: description ? String(description).trim() : '',
      activities: normalizeActivities(activities),
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      status: normalizeStatus(status),
      featured: normalizeFeatured(featured),
    });

    await camp.save();

    res.status(201).json({
      success: true,
      message: 'Camp created successfully',
      camp: mapCampResponse(camp, req),
    });
  } catch (error) {
    console.error('Create camp error:', error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Camp creation failed: duplicate value detected',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create camp',
    });
  }
};

export const updateCamp = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const errors = validateCampPayload(req.body, {
      requireAll: false,
      hasImageFile: Boolean(req.file),
      allowEmptyImage: true,
    });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const updates = {};

    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.name !== undefined) {
      const slugBase = toSlug(req.body.name);
      updates.slug = `${slugBase || 'camp'}-${req.params.id}`;
    }
    if (req.body.date !== undefined) updates.date = parseCampDate(req.body.date);
    if (req.body.location !== undefined) updates.location = String(req.body.location).trim();
    if (req.body.price !== undefined) updates.price = Number(req.body.price);
    if (req.body.description !== undefined) updates.description = String(req.body.description || '').trim();
    if (req.body.activities !== undefined) updates.activities = normalizeActivities(req.body.activities);
    if (req.file || req.body.imageUrl !== undefined) updates.imageUrl = resolveImageUrl(req);
    if (req.body.status !== undefined) updates.status = normalizeStatus(req.body.status);
    if (req.body.featured !== undefined) updates.featured = normalizeFeatured(req.body.featured);

    const camp = await Camp.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
      });
    }

    res.json({
      success: true,
      message: 'Camp updated successfully',
      camp,
    });
  } catch (error) {
    console.error('Update camp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update camp',
    });
  }
};

export const deleteCamp = async (req, res) => {
  try {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const camp = await Camp.findByIdAndDelete(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
      });
    }

    res.json({
      success: true,
      message: 'Camp deleted successfully',
    });
  } catch (error) {
    console.error('Delete camp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete camp',
    });
  }
};

