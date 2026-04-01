import { connectMongoose } from '@/lib/mongoose';
import Memory from '@/models/Memory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    console.log('API HIT: /api/memories');
    await connectMongoose();

    const memories = await Memory.find({ status: { $ne: 'rejected' } })
      .sort({ createdAt: -1 })
      .lean();

    const data = memories.map((memory: any) => ({
      id: String(memory._id),
      _id: String(memory._id),
      image: memory.image,
      imageUrl: memory.imageUrl || memory.image || '',
      title: memory.title,
      caption: memory.caption || '',
      user: memory.user || null,
      userName: memory?.user?.name || 'Camper',
      status: memory.status || 'approved',
      createdAt: memory.createdAt || new Date().toISOString(),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('MEMORIES ERROR:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }

  return Response.json({ success: false, error: 'Unknown error' }, { status: 500 });
}
