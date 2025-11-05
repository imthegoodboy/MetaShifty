import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MANAGER_ADDRESS as string;
const MANAGER_ABI = [
  "function payView(uint256 id, bytes32 viewId, address viewer)"
];

export async function POST(req: NextRequest) {
  const { id, viewer, nonce } = await req.json();
  const viewId = ethers.id(`${id}:${viewer}:${nonce}`);
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const wallet = new ethers.Wallet(process.env.SERVER_SIGNER_KEY as string, provider);
  const manager = new ethers.Contract(MANAGER_ADDRESS, MANAGER_ABI, wallet);
  const tx = await manager.payView(id, viewId, viewer);
  const receipt = await tx.wait();
  return NextResponse.json({ tx: receipt?.hash, viewId });
}



