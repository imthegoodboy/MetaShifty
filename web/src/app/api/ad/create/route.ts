import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { getDb } from "../../../../lib/mongo";
import { ethers } from "ethers";

const MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MANAGER_ADDRESS as string;
const MANAGER_ABI = [
  "function createCampaign(uint256 slotId,string creativeURI,string clickURL,address paymentToken,uint256 pricePerView) returns (uint256)",
];

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { slotId, creativeURI, clickURL, pricePerView } = body;

    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
    const wallet = new ethers.Wallet(process.env.SERVER_SIGNER_KEY as string, provider);
    const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, wallet);

    const tx = await manager.createCampaign(slotId, creativeURI, clickURL, ethers.ZeroAddress, BigInt(pricePerView));
    const receipt = await tx.wait();
    const id = receipt?.logs?.[0] ? Number(receipt.logs[0].topics[1]) : undefined;

    // update user freeAdsRemaining and store campaign record
    const db = await getDb();
    const users = db.collection("users");
    const campaigns = db.collection("campaigns");
  const { ObjectId } = await import("mongodb");
  const uid = new ObjectId(payload.sub);

    const user = await users.findOne({ _id: uid });
    if (user) {
      const remaining = (user.freeAdsRemaining ?? 0) - 1;
      await users.updateOne({ _id: uid }, { $set: { freeAdsRemaining: Math.max(0, remaining) } });
    }

    await campaigns.insertOne({ ownerId: uid, slotId, creativeURI, clickURL, pricePerView: String(pricePerView), createdAt: new Date(), contractCampaignId: id });

    return NextResponse.json({ id, ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
