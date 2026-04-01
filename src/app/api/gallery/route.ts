import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const revalidate = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API HIT: /api/gallery');
    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_GALLERY_COLLECTION || "galleryImages";

    const images = await db
      .collection(collectionName)
      .find({})
      .sort({ createdAt: -1 })
      .limit(48)
      .toArray();

    const normalized = images.map((doc) => ({
      id: String(doc._id),
      ...doc,
      _id: undefined,
    }));

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('[API_GALLERY] GET failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 });
}
