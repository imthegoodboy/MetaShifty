import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { verifyToken, hashPassword, verifyPassword } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { rateLimitMiddleware, strictRateLimit } from "../../../../lib/ratelimit";

export async function POST(req: NextRequest) {
  // Rate limiting - strict for profile updates
  const rateLimitResponse = rateLimitMiddleware(req, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const token = req.cookies.get("ms_token")?.value;
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { walletAddress, currentPassword, newPassword, displayName } = body;

    const db = await getDb();
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(payload.sub) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateFields: Record<string, any> = {};

    // Validate wallet address format if provided
    if (walletAddress !== undefined) {
      if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return NextResponse.json(
          { error: "Invalid wallet address format" },
          { status: 400 }
        );
      }
      updateFields.walletAddress = walletAddress || null;
    }

    // Update display name if provided
    if (displayName !== undefined) {
      if (displayName && (displayName.length < 2 || displayName.length > 50)) {
        return NextResponse.json(
          { error: "Display name must be 2-50 characters" },
          { status: 400 }
        );
      }
      updateFields.displayName = displayName || null;
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password required to change password" },
          { status: 400 }
        );
      }

      if (!verifyPassword(currentPassword, user.passwordHash)) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      updateFields.passwordHash = hashPassword(newPassword);
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updateFields.updatedAt = new Date();

    await users.updateOne(
      { _id: new ObjectId(payload.sub) },
      { $set: updateFields }
    );

    return NextResponse.json({
      ok: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
