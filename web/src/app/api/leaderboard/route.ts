import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../lib/mongo";
import { rateLimitMiddleware, normalRateLimit } from "../../../lib/ratelimit";

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimitMiddleware(req, normalRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const db = await getDb();
    const users = db.collection("users");
    const campaigns = db.collection("campaigns");
    const placements = db.collection("placements");

    // Top hosts by earnings
    const topHosts = await placements.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$userId",
          totalEarnings: { $sum: "$earnings" },
          totalImpressions: { $sum: "$impressions" },
          totalClicks: { $sum: "$clicks" },
          placementCount: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          email: { $ifNull: ["$user.email", "Anonymous"] },
          walletAddress: "$user.walletAddress",
          totalEarnings: 1,
          totalImpressions: 1,
          totalClicks: 1,
          placementCount: 1,
        },
      },
    ]).toArray();

    // Top advertisers by campaigns
    const topAdvertisers = await campaigns.aggregate([
      {
        $group: {
          _id: "$advertiserId",
          totalBudget: { $sum: "$budget" },
          totalImpressions: { $sum: "$impressions" },
          totalClicks: { $sum: "$clicks" },
          campaignCount: { $sum: 1 },
        },
      },
      { $sort: { totalBudget: -1 } },
      { $limit: 10 },
    ]).toArray();

    // Look up advertiser details
    const advertiserIds: ObjectId[] = topAdvertisers
      .map((a) => {
        try {
          return new ObjectId(a._id);
        } catch {
          return null;
        }
      })
      .filter((id): id is ObjectId => id !== null);

    const advertiserUsers = advertiserIds.length === 0
      ? []
      : await users
          .find({ _id: { $in: advertiserIds } })
          .toArray();

    const advertiserMap = new Map(
      advertiserUsers.map((u) => [String(u._id), u])
    );

    const topAdvertisersWithDetails = topAdvertisers.map((a) => {
      const user = advertiserMap.get(String(a._id));
      return {
        ...a,
        email: user?.email || "Anonymous",
        walletAddress: user?.walletAddress,
      };
    });

    // Platform stats
    const platformStats = {
      totalUsers: await users.countDocuments(),
      totalCampaigns: await campaigns.countDocuments(),
      totalPlacements: await placements.countDocuments(),
      totalImpressions: (await campaigns.aggregate([
        { $group: { _id: null, total: { $sum: "$impressions" } } }
      ]).toArray())[0]?.total || 0,
      totalClicks: (await campaigns.aggregate([
        { $group: { _id: null, total: { $sum: "$clicks" } } }
      ]).toArray())[0]?.total || 0,
    };

    return NextResponse.json({
      topHosts,
      topAdvertisers: topAdvertisersWithDetails,
      platformStats,
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
