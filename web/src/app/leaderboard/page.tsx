"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TableRowSkeleton } from '../../components/Skeleton';

interface LeaderboardEntry {
  _id: string;
  email: string;
  walletAddress?: string;
  totalEarnings?: number;
  totalBudget?: number;
  totalImpressions: number;
  totalClicks: number;
  placementCount?: number;
  campaignCount?: number;
}

interface PlatformStats {
  totalUsers: number;
  totalCampaigns: number;
  totalPlacements: number;
  totalImpressions: number;
  totalClicks: number;
}

export default function LeaderboardPage() {
  const [topHosts, setTopHosts] = useState<LeaderboardEntry[]>([]);
  const [topAdvertisers, setTopAdvertisers] = useState<LeaderboardEntry[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hosts' | 'advertisers'>('hosts');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setTopHosts(data.topHosts || []);
        setTopAdvertisers(data.topAdvertisers || []);
        setPlatformStats(data.platformStats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const truncateEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (name.length > 6) {
      return `${name.slice(0, 3)}***@${domain}`;
    }
    return email;
  };

  const truncateAddress = (address?: string) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/metashift-logo.jpg" alt="MetaShift" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              MetaShift
            </span>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Home
            </Link>
            <Link href="/signin" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-600 text-lg">Top performers on the MetaShift platform</p>
        </div>

        {/* Platform Stats */}
        {platformStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-purple-600">{platformStats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-blue-600">{platformStats.totalCampaigns.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Campaigns</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-green-600">{platformStats.totalPlacements.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Placements</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-orange-600">{platformStats.totalImpressions.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Views</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-pink-600">{platformStats.totalClicks.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Clicks</p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('hosts')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'hosts'
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🏠 Top Hosts
          </button>
          <button
            onClick={() => setActiveTab('advertisers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'advertisers'
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📢 Top Advertisers
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : activeTab === 'hosts' ? (
            topHosts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-2">No hosts yet</p>
                <p className="text-sm">Be the first to host ads and earn rewards!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topHosts.map((host, index) => (
                  <div key={host._id || index} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                    <span className="text-2xl w-10 text-center">{getRankBadge(index)}</span>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(host.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{truncateEmail(host.email)}</p>
                      <p className="text-sm text-gray-500">{truncateAddress(host.walletAddress)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${(host.totalEarnings || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{host.totalImpressions?.toLocaleString() || 0} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            topAdvertisers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-2">No advertisers yet</p>
                <p className="text-sm">Be the first to create a campaign!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topAdvertisers.map((advertiser, index) => (
                  <div key={advertiser._id || index} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                    <span className="text-2xl w-10 text-center">{getRankBadge(index)}</span>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(advertiser.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{truncateEmail(advertiser.email)}</p>
                      <p className="text-sm text-gray-500">{advertiser.campaignCount || 0} campaigns</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">${(advertiser.totalBudget || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{advertiser.totalImpressions?.toLocaleString() || 0} impressions</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to climb the leaderboard?</h2>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Start Earning
            </Link>
            <Link
              href="/"
              className="px-8 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
