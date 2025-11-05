import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/mongo";
import { verifyToken } from "../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const campaigns = db.collection("campaigns");
    
    const userCampaigns = await campaigns
      .find({ advertiserId: payload.sub })
      .sort({ createdAt: -1 })
      .toArray();

    const totalSpent = userCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalImpressions = userCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = userCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);

    return NextResponse.json({
      campaigns: userCampaigns,
      stats: {
        totalSpent,
        totalImpressions,
        totalClicks,
      },
    });
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
