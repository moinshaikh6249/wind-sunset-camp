import Message from '../models/Message.js';
import { validateMessageData } from '../utils/validators.js';

export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    const errors = validateMessageData({ name, email, subject, message });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const newMessage = new Message({
      userId: req.user?.userId || null,
      name,
      email: email.toLowerCase(),
      subject,
      message,
      category: category || 'inquiry',
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { read, page = 1, limit = 10, sort = 'newest' } = req.query;

    const query = {};
    if (read !== undefined) {
      query.read = read === 'true';
    }

    const sortOption = sort === 'oldest' ? { timestamp: 1 } : { timestamp: -1 };
    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .populate('userId', 'firstName lastName email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({
      success: true,
      messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate('userId', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      message: message,
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: error.message,
    });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
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
      error: error.message,
    });
  }
};

