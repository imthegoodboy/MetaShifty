import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    const placements = db.collection("placements");

    // Aggregate analytics for the developer
    const analytics = await placements.aggregate([
      {
        $match: {
          developerId: payload.sub
        }
      },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: "$impressions" },
          totalClicks: { $sum: "$clicks" },
          totalEarnings: { $sum: "$earnings" },
          activeTokens: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0]
            }
          }
        }
      }
    ]).toArray();

    const result = analytics[0] || {
      totalImpressions: 0,
      totalClicks: 0,
      totalEarnings: 0,
      activeTokens: 0
    };

    // Calculate click-through rate
    const clickRate = result.totalImpressions > 0
      ? (result.totalClicks / result.totalImpressions) * 100
      : 0;

    return NextResponse.json({
      totalImpressions: result.totalImpressions,
      totalClicks: result.totalClicks,
      totalEarnings: result.totalEarnings,
      activeTokens: result.activeTokens,
      clickRate
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}