import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { depositCoin, settleCoin, depositNetwork = "polygon", settleNetwork } = await req.json();
  const apiKey = process.env.SIDESHIFT_API_KEY as string;
  const res = await axios.post(
    "https://api.sideshift.ai/v2/quotes",
    { depositCoin, settleCoin, depositNetwork, settleNetwork },
    { headers: { "x-api-key": apiKey } }
  );
  return NextResponse.json(res.data);
}



