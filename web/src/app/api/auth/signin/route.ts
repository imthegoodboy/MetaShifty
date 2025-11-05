import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { verifyPassword } from "../../../../lib/auth";
import { signToken } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    if (!verifyPassword(password, user.passwordHash)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ sub: String(user._id), email: user.email, role: user.role });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("ms_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
