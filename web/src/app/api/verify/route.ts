import { NextRequest, NextResponse } from "next/server";

// AI verification stub: in production, call a moderation model/provider
export async function POST(req: NextRequest) {
  const { creativeURI, clickURL } = await req.json();
  const isApproved = creativeURI && clickURL && !/nsfw|scam/i.test(creativeURI + clickURL);
  return NextResponse.json({ approved: Boolean(isApproved), reason: isApproved ? "ok" : "blocked" });
}



