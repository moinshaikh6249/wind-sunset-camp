
export type BookingStatus = 'Pending' | 'Approved' | 'Canceled';

// This is the shape of a document in the top-level /bookings collection
export type Booking = {
  id: string; // Document ID from Firestore
  userId?: string; // UID of the user if they were logged in
  fullName: string;
  email: string;
  phone: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  bookingDate: string; // ISO string format
  status: BookingStatus;
};
