import Booking from '../models/Booking.js';
import { sendBookingStatusNotifications } from '../utils/sendEmail.js';

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date(), updatedAt: new Date() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    try {
      await sendBookingStatusNotifications(booking, 'approved');
    } catch (emailError) {
      console.error('Booking approved email error:', emailError.message);
    }

    return res.json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', updatedAt: new Date() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    try {
      await sendBookingStatusNotifications(booking, 'rejected');
    } catch (emailError) {
      console.error('Booking rejected email error:', emailError.message);
    }

    return res.json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};