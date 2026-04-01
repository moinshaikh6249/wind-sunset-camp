import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API HIT: /api/users');
    await connectMongoose();

    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

    const data = users.map((user: any) => ({
      id: String(user._id),
      ...user,
      _id: String(user._id),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('USERS GET ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
