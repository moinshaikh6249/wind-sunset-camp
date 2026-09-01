const CAMP_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || '918080334787';

export type BookingWhatsappPayload = {
  name: string;
  campName: string;
  numberOfPeople: number | string;
  campDate?: string | null;
  phone?: string | null;
  bookingRef?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | string;
  paymentStatus?: 'pending' | 'paid' | string;
  totalPrice?: number | string;
};

export const buildGeneralWhatsappMessage = () => {
  return [
    'Hello Wind & Sunset Camp 👋',
    '',
    'I would like to know more about your camping options.',
    '',
    'Thank you!',
  ].join('\n');
};

export const buildBookingWhatsappMessage = ({
  name,
  campName,
  numberOfPeople,
  campDate,
  phone,
  bookingRef,
  status,
  paymentStatus,
}: BookingWhatsappPayload) => {
  const resolvedDate = campDate && String(campDate).trim() ? String(campDate).trim() : 'To be confirmed';
  const resolvedStatus = status
    ? status === 'approved'
      ? 'Approved'
      : status === 'rejected'
        ? 'Rejected'
        : 'Pending Approval'
    : undefined;
  const resolvedPayment =
    paymentStatus === 'paid' ? 'Paid / Cash Received' : 'Pay at Campsite';

  return [
    'Hello Wind & Sunset Camp 👋',
    '',
    'I have a booking inquiry.',
    '',
    ...(bookingRef ? [`Booking Reference: ${bookingRef}`] : []),
    `Guest Name: ${name}`,
    `Camp: ${campName}`,
    `Date: ${resolvedDate}`,
    `Guests: ${numberOfPeople}`,
    ...(resolvedStatus ? [`Booking Status: ${resolvedStatus}`] : []),
    `Payment: ${resolvedPayment}`,
    ...(phone ? [`Phone: ${phone}`] : []),
    '',
    'I would like to confirm/check some details regarding my booking.',
    '',
    'Thank you!',
  ].join('\n');
};

export const buildPaymentQuestionWhatsappMessage = ({
  name,
  bookingRef,
  totalPrice,
  paymentStatus,
}: BookingWhatsappPayload) => {
  const resolvedPayment =
    paymentStatus === 'paid' ? 'Paid / Cash Received' : 'Pending — Pay at Campsite';

  return [
    'Hello Wind & Sunset Camp 👋',
    '',
    'I have a question about my booking payment.',
    '',
    ...(bookingRef ? [`Booking Reference: ${bookingRef}`] : []),
    `Guest Name: ${name}`,
    `Total Amount: ₹${totalPrice ?? 0}`,
    `Payment Method: Pay at Campsite`,
    `Payment Status: ${resolvedPayment}`,
    '',
    'I would like to ask a question regarding payment at campsite.',
    '',
    'Thank you!',
  ].join('\n');
};

export const buildWhatsappUrl = (
  message: string,
  targetPhone: string = CAMP_WHATSAPP_NUMBER
) => {
  const cleanPhone = String(targetPhone).replace(/[^0-9]/g, '');
  const destination = cleanPhone.length >= 10 ? cleanPhone : CAMP_WHATSAPP_NUMBER;
  return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
};

export const buildBookingWhatsappUrl = (payload: BookingWhatsappPayload) => {
  const message = buildBookingWhatsappMessage(payload);
  return buildWhatsappUrl(message, CAMP_WHATSAPP_NUMBER);
};

export const buildGeneralWhatsappUrl = () => {
  const message = buildGeneralWhatsappMessage();
  return buildWhatsappUrl(message, CAMP_WHATSAPP_NUMBER);
};

export { CAMP_WHATSAPP_NUMBER };