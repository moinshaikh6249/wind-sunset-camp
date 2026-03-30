import nodemailer from 'nodemailer';

let transporterInstance = null;

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getTransporter = () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('Email configuration incomplete (EMAIL_USER or EMAIL_PASS missing); email notifications disabled');
    return null;
  }

  transporterInstance = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporterInstance;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error('Recipient email is required');
  }

  const transporter = getTransporter();
  
  if (!transporter) {
    console.log(`[Email Disabled] Would send to ${to}: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `Wind & Sunset Camp <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Email send failed for ${to}:`, error.message);
  }
};

const buildEmailShell = ({ title, intro, body, footer }) => `
  <div style="font-family: Arial, sans-serif; background: #f4efe6; padding: 24px; color: #1f2937;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: linear-gradient(135deg, #0f766e, #134e4a); color: #ffffff; padding: 24px 28px;">
        <h2 style="margin: 0; font-size: 28px;">Wind & Sunset Camp</h2>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">${title}</p>
      </div>
      <div style="padding: 28px;">
        <p style="margin-top: 0; font-size: 16px; line-height: 1.6;">${intro}</p>
        <div style="margin: 20px 0; padding: 18px; border-radius: 12px; background: #f8fafc; border: 1px solid #e5e7eb;">
          ${body}
        </div>
        <p style="margin-bottom: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">${footer}</p>
      </div>
    </div>
  </div>
`;

const buildBookingRows = (booking) => `
  <p style="margin: 0 0 10px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
  <p style="margin: 0 0 10px;"><strong>People:</strong> ${escapeHtml(booking.numberOfPeople)}</p>
  <p style="margin: 0 0 10px;"><strong>Status:</strong> ${escapeHtml(booking.status)}</p>
  <p style="margin: 0;"><strong>Phone:</strong> ${escapeHtml(booking.phone)}</p>
`;

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '0';
  }

  return amount.toLocaleString('en-IN');
};

export const sendBookingCreatedNotifications = async (booking) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const peopleCount = Number(booking.numberOfPeople) || 0;
  const totalAmount = Number(booking.totalPrice) || 0;
  const pricePerPerson = peopleCount > 0 ? totalAmount / peopleCount : 0;

  const userHtml = buildEmailShell({
    title: 'Booking Confirmation',
    intro: `Hello ${escapeHtml(booking.fullName)},`,
    body: `
      <p style="margin: 0 0 12px;">Your camp booking has been received.</p>
      <p style="margin: 0 0 10px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 10px;"><strong>People:</strong> ${escapeHtml(booking.numberOfPeople)}</p>
      <p style="margin: 0 0 10px;"><strong>Price per person:</strong> ₹${escapeHtml(formatAmount(pricePerPerson))}</p>
      <p style="margin: 0 0 16px;"><strong>Total Amount:</strong> ₹${escapeHtml(formatAmount(totalAmount))}</p>
      <p style="margin: 0 0 10px;"><strong>Payment Method:</strong> Pay at Camp</p>
      <p style="margin: 0 0 10px;"><strong>Location:</strong></p>
      <p style="margin: 0;">Wind &amp; Sunset Camping, Pawna Lake</p>
    `,
    footer: 'We look forward to hosting you!',
  });

  const adminHtml = buildEmailShell({
    title: 'New Camp Booking Received',
    intro: 'A new booking has been created.',
    body: `
      <p style="margin: 0 0 10px;"><strong>User:</strong> ${escapeHtml(booking.fullName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(booking.email)}</p>
      <p style="margin: 0 0 10px;"><strong>Phone:</strong> ${escapeHtml(booking.phone)}</p>
      <p style="margin: 0 0 10px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 10px;"><strong>People:</strong> ${escapeHtml(booking.numberOfPeople)}</p>
      <p style="margin: 0;"><strong>Total:</strong> ₹${escapeHtml(formatAmount(totalAmount))}</p>
    `,
    footer: 'Please review this booking in the admin dashboard.',
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
        subject: 'New Camp Booking Received',
        html: adminHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('Booking created notification email error:', result.reason?.message || result.reason);
    }
  });
};

export const sendBookingStatusNotifications = async (booking, status) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  const normalizedStatus = String(status || '').toLowerCase();
  const userSubject = normalizedStatus === 'approved' ? 'Booking Approved 🎉' : 'Booking Update';
  const userMessage = normalizedStatus === 'approved'
    ? `Your booking for <strong>${escapeHtml(booking.campName)}</strong> has been approved.`
    : `Unfortunately your booking was not approved.`;
  const adminSubject = `Booking ${status}`;
  const adminMessage = normalizedStatus === 'approved'
    ? `The booking for <strong>${escapeHtml(booking.campName)}</strong> has been approved.`
    : `The booking for <strong>${escapeHtml(booking.campName)}</strong> has been rejected.`;

  const userHtml = buildEmailShell({
    title: userSubject,
    intro: `Hello ${escapeHtml(booking.fullName)}`,
    body: `
      <p style="margin: 0 0 12px;">${userMessage}</p>
      ${buildBookingRows({ ...booking, status })}
    `,
    footer: 'If you have any questions, reply to this email or contact the camp team.',
  });
  const adminHtml = buildEmailShell({
    title: adminSubject,
    intro: `A booking status has changed to ${escapeHtml(status)}.`,
    body: `
      <p style="margin: 0 0 10px;"><strong>User:</strong> ${escapeHtml(booking.fullName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(booking.email)}</p>
      <p style="margin: 0 0 10px;"><strong>Camp:</strong> ${escapeHtml(booking.campName)}</p>
      <p style="margin: 0 0 10px;"><strong>Status:</strong> ${escapeHtml(status)}</p>
      <p style="margin: 0;"><strong>People:</strong> ${escapeHtml(booking.numberOfPeople)}</p>
    `,
    footer: 'This is an automated booking status alert from Wind & Sunset Camp.',
  });

  const tasks = [
    sendEmail({
      to: booking.email,
      subject: userSubject,
      html: userHtml,
    }),
  ];

  if (adminEmail) {
    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error(`Booking ${status.toLowerCase()} notification email error:`, result.reason?.message || result.reason);
    }
  });
};