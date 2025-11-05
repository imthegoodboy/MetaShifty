import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { hashPassword, signToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role = "viewer", walletAddress } = body;
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDb();
    const users = db.collection("users");
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ error: "User exists" }, { status: 409 });

    const passwordHash = hashPassword(password);
    const freeAdsRemaining = role === "advertiser" ? 5 : 0;

    const result = await users.insertOne({
      email: email.toLowerCase(),
      passwordHash,
      role,
      freeAdsRemaining,
      walletAddress: walletAddress || null,
      createdAt: new Date(),
    });

    const token = signToken({ sub: String(result.insertedId), email, role });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("ms_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
