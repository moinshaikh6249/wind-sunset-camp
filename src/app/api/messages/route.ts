import { connectMongoose } from '@/lib/mongoose';
import Message from '@/models/Message';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('API HIT: /api/messages');
    const body = await req.json();

    const { name, email, subject, message, category } = body;

    if (!name || !email || !subject || !message) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectMongoose();

    const msg = await Message.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      category: category || 'inquiry',
      read: false,
    });

    return Response.json(
      {
        success: true,
        data: msg,
        message: msg,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('MESSAGE CREATE ERROR:', error);
    return Response.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
