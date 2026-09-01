import Booking from '../models/Booking.js';
import Activity from '../models/Activity.js';
import Camp from '../models/Camp.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { validateBookingData } from '../utils/validators.js';
import {
  sendBookingCreatedNotifications,
  sendBookingStatusNotifications,
  sendBookingApprovedNotification,
  sendBookingRejectedOrCancelledNotification,
  sendPaymentReceivedNotification,
} from '../utils/sendEmail.js';
import { getIO } from '../utils/socket.js';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || '').trim());

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create a booking',
      });
    }

    const { fullName, email, phone, campId, numberOfPeople, specialRequests } = req.body;

    if (!isValidObjectId(campId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const errors = validateBookingData({ fullName, email, phone, campId, numberOfPeople });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const numPeople = parseInt(numberOfPeople, 10);
    if (isNaN(numPeople) || numPeople < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of people must be at least 1',
      });
    }

    // Get camp details to get camp name
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Camp not found',
      });
    }

    if (camp.status === 'inactive' || camp.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'This camp is currently unavailable for booking',
      });
    }

    // Enforce camp capacity if specified
    if (typeof camp.capacity === 'number' && camp.capacity > 0) {
      const existingBookings = await Booking.find({
        campId: camp._id,
        status: { $in: ['pending', 'approved'] },
      }).select('numberOfPeople');

      const currentBookedCount = existingBookings.reduce(
        (sum, b) => sum + (b.numberOfPeople || 0),
        0
      );

      const availableCapacity = camp.capacity - currentBookedCount;

      if (numPeople > availableCapacity) {
        return res.status(400).json({
          success: false,
          message: `Booking exceeds available capacity for this camp. Available spots: ${Math.max(0, availableCapacity)}. Requested: ${numPeople}.`,
          availableCapacity: Math.max(0, availableCapacity),
        });
      }
    }

    const booking = new Booking({
      userId,
      fullName,
      email: email.toLowerCase(),
      phone,
      campId,
      campName: camp.name,
      numberOfPeople: parseInt(numberOfPeople),
      totalPrice: camp.price * numberOfPeople,
      specialRequests: specialRequests || '',
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
    });

    await booking.save();

    try {
      await Notification.create({
        type: 'new_booking_created',
        title: 'New booking created',
        message: `${booking.fullName} booked ${booking.campName}.`,
      });
    } catch (notificationError) {
      console.error('Notification create error (booking):', notificationError.message);
    }

    try {
      getIO()?.emit('newBooking', {
        name: booking.fullName,
        camp: booking.campName,
        people: booking.numberOfPeople,
        date: booking.createdAt,
      });
    } catch (socketError) {
      console.error('Realtime booking notification error:', socketError.message);
    }

    try {
      await sendBookingCreatedNotifications(booking);
    } catch (emailError) {
      console.error('Booking created email error:', emailError.message);
    }

    if (phone) {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (user && (!user.phone || !String(user.phone).trim())) {
        user.phone = phone;
        user.updatedAt = new Date();
        await user.save();
      }
    }

    // Create activity record if user is logged in
    await Activity.create({
      userId,
      type: 'booking',
      description: `Booked camp: ${camp.name}`,
      metadata: {
        bookingId: booking._id,
        campId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your booking request has been received. Please pay at the campsite.',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings',
    });
  }
};

export const deleteMyBooking = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID',
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!booking.userId || booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be canceled',
      });
    }

    await Booking.findByIdAndDelete(id);

    try {
      await Notification.create({
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Booking for ${booking.fullName} (${booking.campName}) was cancelled by the user.`,
      });
    } catch (notificationError) {
      console.error('Notification create error (booking_cancelled):', notificationError.message);
    }

    try {
      await sendBookingRejectedOrCancelledNotification(booking, 'cancelled');
    } catch (emailError) {
      console.error('Booking cancelled email error:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Booking deleted',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const currentPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (currentPage - 1) * pageLimit;

    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('campId', 'name location price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalCount = await Booking.countDocuments(query);
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

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('campId');

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
    console.error('Get booking error:', error);
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

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'approved' && { approvedAt: new Date() }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
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
      await Notification.create({
        type: 'booking_approved',
        title: 'Booking Approved',
        message: `Booking for ${booking.fullName} (${booking.campName}) has been approved.`,
      });
    } catch (notificationError) {
      console.error('Notification create error (booking_approved):', notificationError.message);
    }

    try {
      io?.emit('bookingStatusChanged', {
        bookingId: booking._id,
        status: 'approved',
        campName: booking.campName,
        fullName: booking.fullName,
      });
    } catch (socketError) {
      console.error('Realtime booking status error:', socketError.message);
    }

    try {
      await sendBookingApprovedNotification(booking);
    } catch (emailError) {
      console.error('Booking approved email error:', emailError.message);
    }

    return res.json({
      success: true,
      message: 'Booking approved',
      booking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return res.status(500).json({
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
      await Notification.create({
        type: 'booking_rejected',
        title: 'Booking Rejected',
        message: `Booking for ${booking.fullName} (${booking.campName}) was rejected.`,
      });
    } catch (notificationError) {
      console.error('Notification create error (booking_rejected):', notificationError.message);
    }

    try {
      io?.emit('bookingStatusChanged', {
        bookingId: booking._id,
        status: 'rejected',
        campName: booking.campName,
        fullName: booking.fullName,
      });
    } catch (socketError) {
      console.error('Realtime booking status error:', socketError.message);
    }

    try {
      await sendBookingRejectedOrCancelledNotification(booking, 'rejected');
    } catch (emailError) {
      console.error('Booking rejected email error:', emailError.message);
    }

    return res.json({
      success: true,
      message: 'Booking rejected',
      booking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    return res.status(500).json({
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

    try {
      await Notification.create({
        type: 'booking_cancelled',
        title: 'Booking Deleted',
        message: `Booking for ${booking.fullName} (${booking.campName}) was removed by admin.`,
      });
    } catch (notificationError) {
      console.error('Notification create error (booking_deleted):', notificationError.message);
    }

    try {
      await sendBookingRejectedOrCancelledNotification(booking, 'cancelled');
    } catch (emailError) {
      console.error('Booking deleted email error:', emailError.message);
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

export const markBookingAsPaid = async (req, res) => {
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

    // Idempotency check: If already paid, return safe response without duplicate side effects
    if (booking.paymentStatus === 'paid') {
      return res.json({
        success: true,
        message: 'Booking is already marked as paid',
        booking,
      });
    }

    booking.paymentStatus = 'paid';
    booking.paidAt = new Date();
    booking.updatedAt = new Date();
    await booking.save();

    try {
      await Notification.create({
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ₹${booking.totalPrice || 0} received for ${booking.fullName}'s booking (${booking.campName}).`,
      });
    } catch (notificationError) {
      console.error('Notification create error (payment_received):', notificationError.message);
    }

    try {
      io?.emit('paymentReceived', {
        bookingId: booking._id,
        fullName: booking.fullName,
        campName: booking.campName,
        amount: booking.totalPrice,
        paidAt: booking.paidAt,
      });
    } catch (socketError) {
      console.error('Realtime payment notification error:', socketError.message);
    }

    try {
      await sendPaymentReceivedNotification(booking);
    } catch (emailError) {
      console.error('Payment received email error:', emailError.message);
    }

    return res.json({
      success: true,
      message: 'Payment status updated to paid',
      booking,
    });
  } catch (error) {
    console.error('Mark booking as paid error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
    });
  }
};


