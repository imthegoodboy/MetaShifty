import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MANAGER_ADDRESS as string;
const MANAGER_ABI = [
  "function createCampaign(uint256 slotId,string creativeURI,string clickURL,address paymentToken,uint256 pricePerView) returns (uint256)",
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slotId, creativeURI, clickURL, pricePerView } = body;

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const wallet = new ethers.Wallet(process.env.SERVER_SIGNER_KEY as string, provider);
  const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, wallet);

  const tx = await manager.createCampaign(slotId, creativeURI, clickURL, ethers.ZeroAddress, BigInt(pricePerView));
  const receipt = await tx.wait();
  const id = receipt?.logs?.[0] ? Number(receipt.logs[0].topics[1]) : undefined;
  return NextResponse.json({ id });
}



