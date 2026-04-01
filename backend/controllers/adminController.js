import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
import Camp from '../models/Camp.js';
import GalleryImage from '../models/GalleryImage.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import { sendBookingStatusNotifications } from '../utils/sendEmail.js';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || '').trim());

export const getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.user?.adminId || req.user?.id || req.user?.userId;

    if (!isValidObjectId(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.name,
        email: admin.email,
        role: admin.role || req.user?.role || 'admin',
      },
    });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
    });
  }
};

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

const extractPublicIdFromCloudinaryUrl = (url = '') => {
  const uploadMarker = '/upload/';
  const markerIndex = url.indexOf(uploadMarker);
  if (markerIndex === -1) return null;

  const afterUpload = url.slice(markerIndex + uploadMarker.length);
  const withoutVersion = afterUpload.replace(/^v\d+\//, '');
  const lastDotIndex = withoutVersion.lastIndexOf('.');
  if (lastDotIndex === -1) return withoutVersion;
  return withoutVersion.slice(0, lastDotIndex);
};

const destroyCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

export const uploadCampImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
        data: null,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Camp image uploaded successfully',
      data: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload camp image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload camp image',
      data: null,
    });
  }
};

export const uploadGalleryImage = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
        data: null,
      });
    }

    const descriptionsInput = req.body?.descriptions ?? req.body?.description;
    const descriptions = Array.isArray(descriptionsInput)
      ? descriptionsInput
      : typeof descriptionsInput === 'string'
        ? descriptionsInput.split('|').map((item) => item.trim())
        : [];

    const galleryRecords = files.map((file, index) => {
      const description = descriptions[index] || `Gallery image ${index + 1}`;

      return {
        imageUrl: file.path,
        publicId: file.filename,
        description,
        imageHint: buildImageHint(description),
        uploadedBy: req.user?.userId || null,
        createdAt: new Date(),
      };
    });

    const images = await GalleryImage.insertMany(galleryRecords);

    return res.status(201).json({
      success: true,
      message: 'Gallery images uploaded successfully',
      data: images.map((image) => ({
        _id: image._id,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        description: image.description,
        createdAt: image.createdAt,
      })),
    });
  } catch (error) {
    console.error('Upload gallery image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload gallery image',
      data: null,
    });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
        data: null,
      });
    }

    const image = await GalleryImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found',
        data: null,
      });
    }

    const publicId = image.publicId || extractPublicIdFromCloudinaryUrl(image.imageUrl);
    await destroyCloudinaryImage(publicId);

    await GalleryImage.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Gallery image deleted successfully',
      data: {
        _id: image._id,
        publicId,
      },
    });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete gallery image',
      data: null,
    });
  }
};

export const createCamp = async (req, res) => {
  try {
    const { name, location, price, capacity, description, imageUrl, isActive, slug } = req.body;
    const uploadedImageUrl = req.file?.path;
    const uploadedImagePublicId = req.file?.filename;
    const finalImageUrl = uploadedImageUrl || imageUrl;

    if (!name || !location || price === undefined || capacity === undefined || !description || !finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'name, location, price, capacity, description, and imageUrl or uploaded image are required',
        data: null,
      });
    }

    const camp = await Camp.create({
      name,
      location,
      price,
      capacity,
      description,
      imageUrl: finalImageUrl,
      ...(uploadedImagePublicId ? { imagePublicId: uploadedImagePublicId } : {}),
      isActive: isActive !== undefined ? isActive : true,
      ...(slug ? { slug } : {}),
    });

    return res.status(201).json({
      success: true,
      message: 'Camp created successfully',
      data: camp,
      imageUrl: camp.imageUrl,
      publicId: camp.imagePublicId || null,
      camp,
    });
  } catch (error) {
    console.error('Create camp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create camp',
      data: null,
    });
  }
};

export const updateCamp = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
        data: null,
      });
    }

    const existingCamp = await Camp.findById(req.params.id);

    if (!existingCamp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
        data: null,
      });
    }

    const allowedFields = ['name', 'location', 'price', 'capacity', 'description', 'imageUrl', 'isActive', 'slug'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (req.file?.path) {
      await destroyCloudinaryImage(existingCamp.imagePublicId);
      updates.imageUrl = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    const camp = await Camp.findByIdAndUpdate(existingCamp._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      message: 'Camp updated successfully',
      data: camp,
      imageUrl: camp.imageUrl,
      publicId: camp.imagePublicId || null,
      camp,
    });
  } catch (error) {
    console.error('Update camp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update camp',
      data: null,
    });
  }
};

export const deleteCamp = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
        data: null,
      });
    }

    const camp = await Camp.findByIdAndDelete(req.params.id);

    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
        data: null,
      });
    }

    return res.json({
      success: true,
      message: 'Camp deleted successfully',
      data: {
        _id: camp._id,
      },
    });
  } catch (error) {
    console.error('Delete camp error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete camp',
      data: null,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const currentPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalCount = await User.countDocuments();
    const totalPages = Math.max(Math.ceil(totalCount / pageLimit), 1);

    res.json({
      success: true,
      data: users,
      users,
      currentPage,
      totalPages,
      totalCount,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: pageLimit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBookings, totalCamps, totalReviews, totalMessages] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Camp.countDocuments(),
      Review.countDocuments(),
      Message.countDocuments(),
    ]);

    res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalCamps,
      totalReviews,
      totalMessages,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth() - 11, 1);

    const monthKeys = Array.from({ length: 12 }).map((_, index) => {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const label = date.toLocaleString('en-US', { month: 'short' });
      return {
        key: `${year}-${String(month).padStart(2, '0')}`,
        label,
      };
    });

    const [
      totalUsers,
      totalBookings,
      totalCamps,
      bookingsByMonthAgg,
      revenueByMonthAgg,
      userRegistrationsAgg,
      campPopularityAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Camp.countDocuments(),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            $or: [
              { paymentStatus: 'paid' },
              { status: { $in: ['approved', 'Approved'] } },
            ],
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            revenue: { $sum: { $ifNull: ['$totalPrice', 0] } },
          },
        },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: '$campName',
            bookings: { $sum: 1 },
          },
        },
        { $sort: { bookings: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const bookingsMap = new Map(
      bookingsByMonthAgg.map((item) => [
        `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        item.count,
      ])
    );

    const revenueMap = new Map(
      revenueByMonthAgg.map((item) => [
        `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        item.revenue,
      ])
    );

    const usersMap = new Map(
      userRegistrationsAgg.map((item) => [
        `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        item.count,
      ])
    );

    const bookingsPerMonth = monthKeys.map((month) => ({
      month: month.label,
      count: bookingsMap.get(month.key) || 0,
    }));

    const revenuePerMonth = monthKeys.map((month) => ({
      month: month.label,
      revenue: Number(revenueMap.get(month.key) || 0),
    }));

    const userRegistrations = monthKeys.map((month) => ({
      month: month.label,
      count: usersMap.get(month.key) || 0,
    }));

    const campPopularity = campPopularityAgg.map((item) => ({
      campName: item._id || 'Unknown Camp',
      bookings: item.bookings || 0,
    }));

    return res.json({
      success: true,
      totals: {
        totalUsers,
        totalBookings,
        totalCamps,
      },
      bookingsPerMonth,
      revenuePerMonth,
      userRegistrations,
      campPopularity,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const currentPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const bookings = await Booking.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalCount = await Booking.countDocuments();
    const totalPages = Math.max(Math.ceil(totalCount / pageLimit), 1);

    res.json({
      success: true,
      data: bookings,
      bookings,
      currentPage,
      totalPages,
      totalCount,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: pageLimit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const { status } = req.body;
    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required',
      });
    }

    const updates = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'approved') {
      updates.approvedAt = new Date();
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
    });
  }
};

export const approveBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'approved';
    booking.approvedAt = new Date();
    booking.updatedAt = new Date();
    await booking.save();

    try {
      await sendBookingStatusNotifications(booking, 'approved');
    } catch (emailError) {
      console.error('Booking approved email error:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Booking approved',
      booking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking',
    });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'rejected';
    booking.updatedAt = new Date();
    await booking.save();

    try {
      await sendBookingStatusNotifications(booking, 'rejected');
    } catch (emailError) {
      console.error('Booking rejected email error:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Booking rejected',
      booking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking',
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
    });
  }
};

export const updateReviewVisibility = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const { visible } = req.body;

    if (typeof visible !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'visible must be a boolean',
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { visible, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review visibility updated successfully',
      review,
    });
  } catch (error) {
    console.error('Update review visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review visibility',
    });
  }
};

export const updateReviewPin = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const { pinned } = req.body;

    if (typeof pinned !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'pinned must be a boolean',
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { pinned, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review pin status updated successfully',
      review,
    });
  } catch (error) {
    console.error('Update review pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review pin status',
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

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
    });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const currentPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalCount = await Message.countDocuments();
    const totalPages = Math.max(Math.ceil(totalCount / pageLimit), 1);

    res.json({
      success: true,
      data: messages,
      messages,
      currentPage,
      totalPages,
      totalCount,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: pageLimit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

export const getMessageById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Get message by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
    });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.id || req.body?.messageId;
    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is missing',
      });
    }

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const { read } = req.body;
    const readValue = typeof read === 'boolean' ? read : true;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: readValue },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      message: 'Message read status updated successfully',
      data: message,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message read status',
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};

