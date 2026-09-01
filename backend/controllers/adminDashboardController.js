import Booking from '../models/Booking.js';
import Camp from '../models/Camp.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalCamps, totalBookings, totalReviews, totalMessages, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      Camp.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Message.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
    ]);

    return res.json({
      success: true,
      totalUsers,
      totalCamps,
      totalBookings,
      totalReviews,
      totalMessages,
      pendingApprovals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

if (typeof module !== 'undefined') {
  module.exports = {
    getAdminStats,
  };
}