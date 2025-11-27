import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/mongo";
import { verifyToken } from "../../../lib/auth";
import { rateLimitMiddleware, normalRateLimit } from "../../../lib/ratelimit";

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimitMiddleware(req, normalRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const campaigns = db.collection("campaigns");
    const placements = db.collection("placements");

    // Get user's campaigns (for advertisers)
    const userCampaigns = await campaigns
      .find({ advertiserId: payload.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Get user's placements (for hosts)
    const userPlacements = await placements
      .find({ userId: payload.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Build transaction history from campaigns and placements
    const transactions: any[] = [];

    // Campaign funding transactions
    for (const campaign of userCampaigns) {
      if (campaign.txHash) {
        transactions.push({
          type: 'campaign_funding',
          txHash: campaign.txHash,
          amount: campaign.budget || 0,
          currency: 'MATIC',
          description: `Funded campaign: ${campaign.title}`,
          status: 'confirmed',
          timestamp: campaign.createdAt,
          direction: 'out',
        });
      }
    }

    // Placement earnings (simulated - in production would come from on-chain events)
    for (const placement of userPlacements) {
      if (placement.earnings && placement.earnings > 0) {
        transactions.push({
          type: 'earning',
          txHash: placement.lastPaymentTx || null,
          amount: placement.earnings,
          currency: 'MATIC',
          description: `Ad earnings from placement`,
          status: 'confirmed',
          timestamp: placement.lastEarningDate || placement.createdAt,
          direction: 'in',
        });
      }
    }

    // Sort by timestamp descending
    transactions.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    // Calculate summary
    const totalEarnings = transactions
      .filter(t => t.direction === 'in')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter(t => t.direction === 'out')
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      transactions,
      summary: {
        totalEarnings,
        totalSpent,
        netBalance: totalEarnings - totalSpent,
        transactionCount: transactions.length,
      },
    });
  } catch (err) {
    console.error("Transactions error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
