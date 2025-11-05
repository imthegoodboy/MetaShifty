import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { getDb } from "../../../../lib/mongo";

function makeToken(len = 10) {
  return [...Array(len)].map(() => (Math.random() * 36 | 0).toString(36)).join('');
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { campaignId } = body;
    if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });

    const db = await getDb();
    const campaigns = db.collection('campaigns');
    const placements = db.collection('placements');
    const { ObjectId } = await import('mongodb');

    const camp = await campaigns.findOne({ _id: new ObjectId(campaignId) });
    if (!camp) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    // create a unique token
    let tokenStr = makeToken(12);
    // mild uniqueness check
    while (await placements.findOne({ token: tokenStr })) {
      tokenStr = makeToken(12);
    }

    const result = await placements.insertOne({ campaignId: new ObjectId(campaignId), developerId: payload.sub, token: tokenStr, createdAt: new Date(), impressions: 0, clicks: 0 });

    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = `${base}/r/${tokenStr}`;

    return NextResponse.json({ ok: true, placementId: result.insertedId, token: tokenStr, url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
