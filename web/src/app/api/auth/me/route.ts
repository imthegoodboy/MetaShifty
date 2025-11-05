import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { getDb } from "../../../../lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ user: null });

    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new (await import("mongodb")).ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
