import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MANAGER_ADDRESS as string;
const MANAGER_ABI = [
  "function fundCampaign(uint256 id, uint256 amount) payable",
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, amount } = body as { id: number; amount: string };

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const wallet = new ethers.Wallet(process.env.SERVER_SIGNER_KEY as string, provider);
  const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, wallet);

  const tx = await manager.fundCampaign(id, amount, { value: BigInt(amount) });
  const receipt = await tx.wait();
  return NextResponse.json({ tx: receipt?.hash });
}



