import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const SLOT_ADDRESS = process.env.NEXT_PUBLIC_SLOT_ADDRESS as string;
const SLOT_ABI = [
  "function mintSlot(address to, string slotURI) returns (uint256)",
];

export async function POST(req: NextRequest) {
  const { slotURI } = await req.json();

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const wallet = new ethers.Wallet(process.env.SERVER_SIGNER_KEY as string, provider);
  const slot = new ethers.Contract(SLOT_ADDRESS, SLOT_ABI, wallet);

  const tx = await slot.mintSlot(wallet.address, slotURI);
  const receipt = await tx.wait();
  const tokenId = receipt?.logs?.[0] ? Number(receipt.logs[0].topics[3]) : undefined;
  return NextResponse.json({ tokenId });
}



