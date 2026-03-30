const CAMP_WHATSAPP_NUMBER = '918080334787';

type BookingWhatsappPayload = {
  name: string;
  campName: string;
  numberOfPeople: number | string;
  campDate?: string | null;
  phone: string;
};

export const buildBookingWhatsappMessage = ({
  name,
  campName,
  numberOfPeople,
  campDate,
  phone,
}: BookingWhatsappPayload) => {
  const resolvedDate = campDate && String(campDate).trim() ? String(campDate).trim() : 'To be confirmed';

  return [
    'Hello Wind & Sunset Camp,',
    '',
    'I just booked a camp.',
    '',
    `Name: ${name}`,
    `Camp: ${campName}`,
    `People: ${numberOfPeople}`,
    `Date: ${resolvedDate}`,
    '',
    `Phone: ${phone}`,
  ].join('\n');
};

export const buildBookingWhatsappUrl = (payload: BookingWhatsappPayload) => {
  const message = buildBookingWhatsappMessage(payload);

  return `https://wa.me/${CAMP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export { CAMP_WHATSAPP_NUMBER };