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
    const campaigns = db.collection("campaigns");

    const user = await users.findOne({ _id: payload.sub });
    
    if (!user || user.role !== 'advertiser') {
      return NextResponse.json({ error: "Only advertisers can create campaigns" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, targetUrl, imageUrl, budget, useFreeCampaign } = body;

    if (!title || !description || !targetUrl || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let isFreeAd = false;
    let finalBudget = parseFloat(budget) || 0;

    if (useFreeCampaign) {
      if (user.freeAdsRemaining <= 0) {
        return NextResponse.json({ error: "No free campaign credits remaining" }, { status: 400 });
      }
      isFreeAd = true;
      finalBudget = 0;
      
      await users.updateOne(
        { _id: payload.sub },
        { $inc: { freeAdsRemaining: -1 } }
      );
    } else {
      if (finalBudget < 10) {
        return NextResponse.json({ error: "Minimum budget is $10" }, { status: 400 });
      }
    }

    const campaign = {
      advertiserId: payload.sub,
      title,
      description,
      targetUrl,
      imageUrl,
      budget: finalBudget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      status: 'active',
      isFreeAd,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await campaigns.insertOne(campaign);

    return NextResponse.json({
      success: true,
      campaignId: result.insertedId,
      campaign: { ...campaign, _id: result.insertedId },
    });
  } catch (err) {
    console.error("Error creating campaign:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
