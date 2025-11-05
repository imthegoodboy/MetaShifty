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

    // Get all placements for this developer, including campaign details
    const userPlacements = await placements.aggregate([
      { 
        $match: { 
          developerId: payload.sub 
        } 
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      {
        $unwind: '$campaign'
      },
      {
        $project: {
          _id: 1,
          token: 1,
          status: 1,
          impressions: 1,
          clicks: 1,
          earnings: 1,
          createdAt: 1,
          campaign: {
            _id: 1,
            title: 1,
            description: 1,
            imageUrl: 1,
            budget: 1
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    return NextResponse.json({ placements: userPlacements });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}