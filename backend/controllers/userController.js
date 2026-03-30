import Activity from '../models/Activity.js';
import User from '../models/User.js';

const canAccessUser = (requestUser, requestedUserId) => {
  const tokenUserId = requestUser?.userId || requestUser?.id;
  return tokenUserId?.toString() === requestedUserId?.toString() || requestUser?.role === 'admin' || requestUser?.role === 'super-admin';
};

export const getUserById = async (req, res) => {
  try {
    if (!canAccessUser(req.user, req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    return res.json({
      success: true,
      name,
      email: user.email,
      phone: user.phone,
      user: {
        id: user._id,
        name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        photoURL: user.photoURL,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    if (!canAccessUser(req.user, req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const history = await Activity.find({ userId: req.params.id }).sort({ timestamp: -1 });

    return res.json({
      success: true,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user history',
      error: error.message,
    });
  }
};