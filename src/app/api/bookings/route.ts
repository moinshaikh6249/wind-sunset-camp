import { connectMongoose } from '@/lib/mongoose';
import Booking from '@/models/Booking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('API HIT: /api/bookings');
    const body = await req.json();

    const { fullName, email, phone, campId, numberOfPeople } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !campId || numberOfPeople === undefined) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectMongoose();

    const booking = await Booking.create({
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      phone: String(phone).trim(),
      campId: String(campId),
      numberOfPeople: Number(numberOfPeople),
      status: 'pending',
    });

    console.log('BOOKING CREATED:', {
      id: String(booking._id),
      email: booking.email,
      campId: booking.campId,
    });

    return Response.json(
      {
        success: true,
        data: booking,
        booking: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('BOOKING ERROR:', error);
    return Response.json(
      { success: false, error: 'Booking failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('API HIT: /api/bookings GET');
    await connectMongoose();

    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(100);

    return Response.json({
      success: true,
      data: bookings,
      bookings: bookings,
    });
  } catch (error) {
    console.error('BOOKINGS GET ERROR:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
