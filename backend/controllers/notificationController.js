import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || '').trim());

export const getNotifications = async (req, res) => {
  try {
    const currentPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: false }),
    ]);

    const totalPages = Math.max(Math.ceil(totalCount / pageLimit), 1);

    res.json({
      success: true,
      data: notifications,
      notifications,
      currentPage,
      totalPages,
      totalCount,
      unreadCount,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: pageLimit,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is missing',
      });
    }

    if (!isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification',
    });
  }
};

export const markAllNotificationsAsRead = async (_req, res) => {
  try {
    const result = await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

export const deleteAllNotifications = async (_req, res) => {
  try {
    const result = await Notification.deleteMany({});

    res.json({
      success: true,
      message: 'All notifications deleted',
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
    });
  }
};
