
export type BookingStatus = 'pending' | 'approved' | 'rejected';
export type PaymentMethod = 'cash';
export type PaymentStatus = 'pending';

// This is the shape of a booking record from the /bookings API
export type Booking = {
  id: string; // Booking ID from MongoDB
  _id?: string;
  userId?: string; // UID of the user if they were logged in
  fullName: string;
  email: string;
  phone: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  totalPrice?: number;
  bookingDate?: string; // ISO string format
  createdAt?: string;
  status: BookingStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
};
