
export type BookingStatus = 'Pending' | 'Approved' | 'Canceled';

export type DbBooking = {
  bookingDate: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  userId: string;
  status?: BookingStatus; // Status can be optional in the DB, but we default to 'Pending'
};

export type DbUser = {
  firstName: string;
  lastName?: string;
  email: string;
  bookings?: { [bookingId: string]: DbBooking };
};

export type DbUsers = {
  [uid: string]: DbUser;
};

// This type represents a booking after it has been aggregated with user details
export type AggregatedBooking = {
  userId: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  status: BookingStatus; // In our code, status will always be defined
};
