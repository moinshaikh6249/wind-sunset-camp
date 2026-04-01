import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
