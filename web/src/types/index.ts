export interface User {
  _id: string;
  email: string;
  role: "advertiser" | "host" | "viewer";
  freeAdsRemaining: number;
  walletAddress?: string;
  createdAt: Date;
}

export interface Campaign {
  _id: string;
  advertiserId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: "active" | "paused" | "completed";
  createdAt: Date;
  slotId?: string;
  isFreeAd: boolean;
}

export interface AdSlot {
  _id: string;
  hostId: string;
  tokenId: string;
  name: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
  };
  pricePerImpression: number;
  status: "available" | "occupied" | "inactive";
  currentCampaignId?: string;
  totalEarned: number;
  createdAt: Date;
}

export interface AdView {
  _id: string;
  campaignId: string;
  viewerId?: string;
  slotId: string;
  timestamp: Date;
  reward: number;
}

export interface Analytics {
  totalImpressions: number;
  totalClicks: number;
  totalSpent: number;
  totalEarned: number;
  ctr: number;
  averageCpc: number;
}
