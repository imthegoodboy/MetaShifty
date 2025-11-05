import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const campaigns = db.collection("campaigns");

    const active = await campaigns.find({ status: 'active', paymentConfirmed: true }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ campaigns: active });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
