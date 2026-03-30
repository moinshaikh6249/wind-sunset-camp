import Booking from '../models/Booking.js';
import Camp from '../models/Camp.js';
import User from '../models/User.js';

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalCamps, totalBookings] = await Promise.all([
      User.countDocuments(),
      Camp.countDocuments(),
      Booking.countDocuments(),
    ]);

    return res.json({
      totalUsers,
      totalCamps,
      totalBookings,
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