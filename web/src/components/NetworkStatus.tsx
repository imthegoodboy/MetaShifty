"use client";
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';

export default function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const isCorrectNetwork = chainId === polygonAmoy.id;
  
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-gray-600">Not Connected</span>
      </div>
    );
  }
  
  if (!isCorrectNetwork) {
    return (
      <button
        onClick={() => switchChain?.({ chainId: polygonAmoy.id })}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-full text-sm transition-colors"
      >
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-red-700 font-medium">Switch to Amoy</span>
      </button>
    );
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-green-700 font-medium">Polygon Amoy</span>
    </div>
  );
}
