import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { verifyToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const users = db.collection("users");
    const slots = db.collection("adSlots");

    const user = await users.findOne({ _id: payload.sub });
    
    if (!user || user.role !== 'host') {
      return NextResponse.json({ error: "Only hosts can create ad slots" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, websiteUrl, width, height, pricePerImpression } = body;

    if (!name || !description || !websiteUrl || !width || !height || !pricePerImpression) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adSlot = {
      hostId: payload.sub,
      name,
      description,
      websiteUrl,
      dimensions: {
        width: parseInt(width),
        height: parseInt(height),
      },
      pricePerImpression: parseFloat(pricePerImpression) / 1000,
      status: 'available',
      totalEarned: 0,
      totalImpressions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await slots.insertOne(adSlot);

    return NextResponse.json({
      success: true,
      slotId: result.insertedId,
      adSlot: { ...adSlot, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error creating ad slot:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
