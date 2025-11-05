import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const { token } = req.params as { token: string };
    const db = await getDb();
    const placements = db.collection('placements');
    const campaigns = db.collection('campaigns');
    const { ObjectId } = await import('mongodb');

    const place = await placements.findOne({ token });
    if (!place) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // increment impression counters
    await placements.updateOne({ _id: place._id }, { $inc: { impressions: 1 } });
    await campaigns.updateOne({ _id: new ObjectId(place.campaignId) }, { $inc: { impressions: 1 } });

    // redirect to creative image so the developer page shows the actual creative
    const camp = await campaigns.findOne({ _id: new ObjectId(place.campaignId) });
    const imageUrl = camp?.imageUrl || '/placeholder.png';
    return NextResponse.redirect(imageUrl);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
