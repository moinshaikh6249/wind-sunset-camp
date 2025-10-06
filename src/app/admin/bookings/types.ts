
export type BookingStatus = 'Pending' | 'Approved' | 'Canceled';

export type DbUser = {
  firstName: string;
  lastName?: string;
  email: string;
  bookings?: { [bookingId: string]: DbBooking };
};

export type DbUsers = {
  [uid: string]: DbUser;
};

export type DbBooking = {
  bookingDate: string;
  campId: string;
  campName: string;
  numberOfPeople: number;
  userId: string;
  status: BookingStatus;
};

export type AggregatedBooking = DbBooking & {
  bookingId: string;
  customerName: string;
  customerEmail: string;
};
