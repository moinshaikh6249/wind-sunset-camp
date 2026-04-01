import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const revalidate = 60;
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API HIT: /api/camps/[id]');
    const id = String(params?.id || '').trim();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Camp not found' }, { status: 404 });
    }

    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_CAMPS_COLLECTION || 'camps';

    const camp = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!camp) {
      return NextResponse.json({ success: false, message: 'Camp not found' }, { status: 404 });
    }

    const normalized = {
      id: String(camp._id),
      ...camp,
      _id: undefined,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('[API_CAMPS_ID] GET failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 });
}
