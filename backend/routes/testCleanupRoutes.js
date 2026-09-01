import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const router = express.Router();

const E2E_TEST_EMAILS = [
  'e2e_user_standard@example.com',
  'qa_payment_user@example.com',
  'user@example.com',
  'public.tester@example.com',
];

router.delete('/e2e-bookings', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Cleanup endpoint is disabled in production mode.',
      });
    }

    const cleanupHeader = req.headers['x-e2e-test-cleanup'];
    if (!cleanupHeader || cleanupHeader !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Missing required X-E2E-Test-Cleanup header.',
      });
    }

    // Find user IDs corresponding to E2E test emails
    const testUsers = await User.find({
      $or: [
        { email: { $in: E2E_TEST_EMAILS } },
        { email: { $regex: /@example\.com$/i } },
      ],
    }).select('_id email');

    const testUserIds = testUsers.map((u) => u._id);

    // Delete ONLY bookings that match test user IDs, test emails, or test regex pattern
    const result = await Booking.deleteMany({
      $or: [
        { email: { $in: E2E_TEST_EMAILS } },
        { email: { $regex: /@example\.com$/i } },
        { userId: { $in: testUserIds } },
        { fullName: { $in: ['Test User', 'Payment Tester', 'QA E2E', 'Offline Payment API Tester'] } },
      ],
    });

    return res.status(200).json({
      success: true,
      message: `Successfully cleaned ${result.deletedCount} E2E test bookings.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('[TestCleanup] Failed to clean E2E bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clean E2E bookings.',
      error: error.message,
    });
  }
});

export default router;
