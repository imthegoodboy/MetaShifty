import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const { token } = req.params as { token: string };
    const db = await getDb();
    const placements = db.collection('placements');
    const campaigns = db.collection('campaigns');
    const { ObjectId } = await import('mongodb');

    const place = await placements.findOne({ token });
    if (!place) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // increment click counters
    await placements.updateOne({ _id: place._id }, { $inc: { clicks: 1 } });
    await campaigns.updateOne({ _id: new ObjectId(place.campaignId) }, { $inc: { clicks: 1 } });

    // redirect to advertiser's target URL
    const camp = await campaigns.findOne({ _id: new ObjectId(place.campaignId) });
    const target = camp?.targetUrl || '/';
    return NextResponse.redirect(target);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
