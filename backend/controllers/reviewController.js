import Review from '../models/Review.js';
import Activity from '../models/Activity.js';
import Camp from '../models/Camp.js';
import User from '../models/User.js';
import { validateReviewData } from '../utils/validators.js';

const normalizeReview = (review) => {
  const user = review.userId && typeof review.userId === 'object' ? review.userId : null;
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...review.toObject(),
    userName: fullName || review.name || 'Anonymous Camper',
  };
};

export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ visible: true })
      .populate('userId', 'firstName lastName photoURL')
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ visible: true });

    const averageRating = await Review.aggregate([
      { $match: { visible: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    res.json({
      success: true,
      reviews,
      averageRating: averageRating[0]?.avg || 0,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

export const getReviewsByCamp = async (req, res) => {
  try {
    const reviews = await Review.find({
      campId: req.params.campId,
      visible: true,
    })
      .populate('userId', 'firstName lastName photoURL')
      .sort({ createdAt: -1 });

    const normalizedReviews = reviews.map(normalizeReview);
    const totalReviews = normalizedReviews.length;
    const averageRating = totalReviews > 0
      ? normalizedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.json({
      success: true,
      reviews: normalizedReviews,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error('Get camp reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch camp reviews',
      error: error.message,
    });
  }
};

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, visible } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (visible !== undefined) {
      query.visible = visible === 'true';
    }

    const reviews = await Review.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reviews admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to submit a review',
      });
    }

    const { campId, rating, comment } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
      });
    }

    const errors = validateReviewData({
      campId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      rating,
      comment,
    });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const existingReview = await Review.findOne({ campId, userId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this camp',
      });
    }

    const review = new Review({
      userId,
      campId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email?.toLowerCase() || null,
      rating: parseInt(rating),
      comment: String(comment).trim(),
      visible: true,
      verified: true,
    });

    await review.save();

    await review.populate('userId', 'firstName lastName photoURL');

    // Create activity record if user is logged in
    await Activity.create({
      userId,
      type: 'review',
      description: `Reviewed camp: ${camp.name}`,
      metadata: {
        reviewId: review._id,
        campId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: normalizeReview(review),
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(rating && { rating: parseInt(rating) }),
        ...(comment && { comment }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: normalizeReview(review),
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

export const toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.visible = !review.visible;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.visible ? 'published' : 'hidden'} successfully`,
      review,
    });
  } catch (error) {
    console.error('Toggle review visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

export const toggleReviewPin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.pinned = !review.pinned;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.pinned ? 'pinned' : 'unpinned'} successfully`,
      review,
    });
  } catch (error) {
    console.error('Toggle review pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

