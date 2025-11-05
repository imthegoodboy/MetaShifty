import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/mongo";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const slots = db.collection("adSlots");
    
    const userSlots = await slots
      .find({ hostId: payload.sub })
      .sort({ createdAt: -1 })
      .toArray();

    const totalEarned = userSlots.reduce((sum, s) => sum + (s.totalEarned || 0), 0);

    return NextResponse.json({
      slots: userSlots,
      stats: {
        totalEarned,
      },
    });
  } catch (err) {
    console.error("Error fetching ad slots:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
