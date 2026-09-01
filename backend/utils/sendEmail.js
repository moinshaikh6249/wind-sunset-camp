import nodemailer from 'nodemailer';
import logger from './logger.js';

let transporterInstance = null;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '0';
  }
  return amount.toLocaleString('en-IN');
};

const getBookingRef = (booking) => {
  const rawId = booking?._id || booking?.id || '000000';
  return `WSC-${String(rawId).slice(-6).toUpperCase()}`;
};

const getTransporter = () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;

  if (!emailUser || !emailPass) {
    logger.warn('Email configuration incomplete; email notifications disabled');
    return null;
  }

  if (smtpHost) {
    transporterInstance = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporterInstance;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error('Recipient email is required');
  }

  const transporter = getTransporter();
  const fromUser = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@windsunsetcamp.com';

  if (!transporter) {
    logger.info('Email disabled, skipping send', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: `Wind & Sunset Camp <${fromUser}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Email send failed', { to, error: error.message });
  }
};

const buildEmailShell = ({ title, intro, body, footer, buttonUrl, buttonText }) => `
  <div style="font-family: Arial, sans-serif; background: #f4efe6; padding: 24px; color: #1f2937;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #245745, #141e28); color: #ffffff; padding: 28px;">
        <h2 style="margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">WIND & SUNSET CAMP</h2>
        <p style="margin: 8px 0 0; font-size: 14px; color: #f59e0b; text-transform: uppercase; tracking: 1px; font-weight: 600;">${title}</p>
      </div>
      <div style="padding: 28px;">
        <p style="margin-top: 0; font-size: 16px; line-height: 1.6; color: #1f2937;">${intro}</p>
        <div style="margin: 20px 0; padding: 20px; border-radius: 12px; background: #faf8f5; border: 1px solid #e4dec8;">
          ${body}
        </div>
        ${buttonUrl && buttonText ? `
          <div style="text-align: center; margin: 28px 0 20px;">
            <a href="${escapeHtml(buttonUrl)}" style="background: #ee6d16; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; inline-block;">
              ${escapeHtml(buttonText)}
            </a>
          </div>
        ` : ''}
        <p style="margin-bottom: 0; font-size: 13px; line-height: 1.6; color: #6b7280; border-t: 1px solid #f3f4f6; padding-top: 16px;">${footer}</p>
      </div>
    </div>
  </div>
`;

export const sendBookingCreatedNotifications = async (booking) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const bookingRef = getBookingRef(booking);
  const peopleCount = Number(booking.numberOfPeople) || 0;
  const totalAmount = Number(booking.totalPrice) || 0;

  const userHtml = buildEmailShell({
    title: 'Booking Request Received',
    intro: `Hello ${escapeHtml(booking.fullName)},`,
    body: `
      <p style="margin: 0 0 12px; font-size: 15px; color: #15803d; font-weight: 600;">Your booking request has been received. Payment will be collected at the campsite.</p>
      <p style="margin: 0 0 8px;"><strong>Booking Reference:</strong> <span style="font-family: monospace; color: #b45309; font-weight: bold;">${escapeHtml(bookingRef)}</span></p>
      <p style="margin: 0 0 8px;"><strong>Customer Name:</strong> ${escapeHtml(booking.fullName)}</p>
      <p style="margin: 0 0 8px;"><strong>Campsite:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 8px;"><strong>Number of Guests:</strong> ${escapeHtml(peopleCount)} Person(s)</p>
      <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> ₹${escapeHtml(formatAmount(totalAmount))}</p>
      <p style="margin: 0 0 8px;"><strong>Booking Status:</strong> <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Pending Approval</span></p>
      <p style="margin: 0;"><strong>Payment Method:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Pay at Campsite</span></p>
    `,
    footer: 'Thank you for choosing Wind & Sunset Camp. Present your Booking Pass upon arrival at check-in.',
  });

  const adminHtml = buildEmailShell({
    title: 'New Camp Booking Alert',
    intro: 'A new campsite booking request has been submitted by a guest.',
    body: `
      <p style="margin: 0 0 8px;"><strong>Booking Reference:</strong> <span style="font-family: monospace; color: #b45309; font-weight: bold;">${escapeHtml(bookingRef)}</span></p>
      <p style="margin: 0 0 8px;"><strong>Customer Name:</strong> ${escapeHtml(booking.fullName)}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(booking.email)}</p>
      <p style="margin: 0 0 8px;"><strong>Phone:</strong> ${escapeHtml(booking.phone)}</p>
      <p style="margin: 0 0 8px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 8px;"><strong>Guests:</strong> ${escapeHtml(peopleCount)}</p>
      <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> ₹${escapeHtml(formatAmount(totalAmount))}</p>
      <p style="margin: 0 0 8px;"><strong>Booking Status:</strong> Pending Approval</p>
      <p style="margin: 0;"><strong>Payment Status:</strong> Pending (Pay at Campsite)</p>
    `,
    footer: 'Please log in to the Admin Dashboard to review and approve this booking request.',
  });

  const tasks = [
    sendEmail({
      to: booking.email,
      subject: 'Booking Confirmation — Wind & Sunset Camp',
      html: userHtml,
    }),
  ];

  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: `New Camp Booking Received [${bookingRef}]`,
        html: adminHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((result) => {
    if (result.status === 'rejected') {
      logger.error('Booking created notification email error', {
        error: result.reason?.message || String(result.reason),
      });
    }
  });
};

export const sendBookingApprovedNotification = async (booking) => {
  const bookingRef = getBookingRef(booking);
  const totalAmount = Number(booking.totalPrice) || 0;

  const userHtml = buildEmailShell({
    title: 'Booking Confirmed',
    intro: `Great news ${escapeHtml(booking.fullName)}! Your campsite reservation is confirmed.`,
    body: `
      <p style="margin: 0 0 12px; font-size: 15px; color: #15803d; font-weight: 600;">Your booking for ${escapeHtml(booking.campName)} has been approved.</p>
      <p style="margin: 0 0 8px;"><strong>Booking Reference:</strong> <span style="font-family: monospace; color: #b45309; font-weight: bold;">${escapeHtml(bookingRef)}</span></p>
      <p style="margin: 0 0 8px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 8px;"><strong>Guests:</strong> ${escapeHtml(booking.numberOfPeople)} Person(s)</p>
      <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> ₹${escapeHtml(formatAmount(totalAmount))}</p>
      <p style="margin: 0 0 8px;"><strong>Booking Status:</strong> <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Confirmed</span></p>
      <p style="margin: 0 0 12px;"><strong>Payment Status:</strong> <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Pay at Campsite</span></p>
      <p style="margin: 0; font-size: 13px; color: #4b5563;">Payment is offline and will be collected in cash upon arrival at check-in.</p>
    `,
    footer: 'You can view and print your official Campsite Booking Pass directly from your dashboard.',
  });

  try {
    await sendEmail({
      to: booking.email,
      subject: 'Booking Confirmed — Wind & Sunset Camp',
      html: userHtml,
    });
  } catch (error) {
    logger.error('Booking approved email error', { error: error.message });
  }
};

export const sendBookingRejectedOrCancelledNotification = async (booking, status = 'rejected') => {
  const bookingRef = getBookingRef(booking);
  const isRejected = String(status).toLowerCase() === 'rejected';

  const userHtml = buildEmailShell({
    title: `Booking ${isRejected ? 'Rejected' : 'Cancelled'}`,
    intro: `Hello ${escapeHtml(booking.fullName)},`,
    body: `
      <p style="margin: 0 0 12px; color: #b91c1c; font-weight: 600;">Your booking request for ${escapeHtml(booking.campName)} has been ${isRejected ? 'rejected' : 'cancelled'}.</p>
      <p style="margin: 0 0 8px;"><strong>Booking Reference:</strong> <span style="font-family: monospace;">${escapeHtml(bookingRef)}</span></p>
      <p style="margin: 0 0 8px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0;"><strong>Status:</strong> <span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${isRejected ? 'Rejected' : 'Cancelled'}</span></p>
    `,
    footer: 'If you have any questions or would like to reserve another date, feel free to contact us or browse available camps.',
  });

  try {
    await sendEmail({
      to: booking.email,
      subject: `Booking ${isRejected ? 'Rejected' : 'Cancelled'} — Wind & Sunset Camp`,
      html: userHtml,
    });
  } catch (error) {
    logger.error('Booking status update email error', { status, error: error.message });
  }
};

export const sendPaymentReceivedNotification = async (booking) => {
  const bookingRef = getBookingRef(booking);
  const totalAmount = Number(booking.totalPrice) || 0;
  const formattedPaidAt = booking.paidAt ? new Date(booking.paidAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  const userHtml = buildEmailShell({
    title: 'Payment Receipt',
    intro: `Hello ${escapeHtml(booking.fullName)}, your cash payment has been verified by the campsite team.`,
    body: `
      <p style="margin: 0 0 12px; font-size: 15px; color: #15803d; font-weight: 600;">Payment received and confirmed.</p>
      <p style="margin: 0 0 8px;"><strong>Booking Reference:</strong> <span style="font-family: monospace; color: #b45309; font-weight: bold;">${escapeHtml(bookingRef)}</span></p>
      <p style="margin: 0 0 8px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 8px;"><strong>Guests:</strong> ${escapeHtml(booking.numberOfPeople)} Person(s)</p>
      <p style="margin: 0 0 8px;"><strong>Total Amount Paid:</strong> ₹${escapeHtml(formatAmount(totalAmount))}</p>
      <p style="margin: 0 0 8px;"><strong>Payment Status:</strong> <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">PAID — CASH RECEIVED AT CAMPSITE</span></p>
      <p style="margin: 0;"><strong>Paid At:</strong> ${escapeHtml(formattedPaidAt)}</p>
    `,
    footer: 'Thank you for choosing Wind & Sunset Camp! Enjoy your stay.',
  });

  try {
    await sendEmail({
      to: booking.email,
      subject: `Payment Receipt [${bookingRef}] — Wind & Sunset Camp`,
      html: userHtml,
    });
  } catch (error) {
    logger.error('Payment received email error', { error: error.message });
  }
};

export const sendBookingStatusNotifications = async (booking, status) => {
  const normalizedStatus = String(status || '').toLowerCase();
  if (normalizedStatus === 'approved') {
    return sendBookingApprovedNotification(booking);
  } else {
    return sendBookingRejectedOrCancelledNotification(booking, normalizedStatus);
  }
};