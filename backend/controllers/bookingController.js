import Booking from '../models/Booking.js';
import Activity from '../models/Activity.js';
import Camp from '../models/Camp.js';
import User from '../models/User.js';
import { validateBookingData } from '../utils/validators.js';
import { sendBookingCreatedNotifications, sendBookingStatusNotifications } from '../utils/sendEmail.js';
import { io } from '../server.js';

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create a booking',
      });
    }

    const { fullName, email, phone, campId, numberOfPeople, specialRequests } = req.body;

    const errors = validateBookingData({ fullName, email, phone, campId, numberOfPeople });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
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
      io?.emit('newBooking', {
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
      error: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

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
      error: error.message,
    });
  }
};

export const deleteMyBooking = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
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

    res.json({
      success: true,
      message: 'Booking deleted',
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('campId', 'name location price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
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
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
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
      error: error.message,
    });
  }
};

export const approveBooking = async (req, res) => {
  try {
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
      error: error.message,
    });
  }
};

export const rejectBooking = async (req, res) => {
  try {
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
      error: error.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
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
      error: error.message,
    });
  }
};

