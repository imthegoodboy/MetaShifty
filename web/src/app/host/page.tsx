"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  budget: number;
  impressions: number;
  clicks: number;
  isFreeAd: boolean;
  status: string;
  createdAt: string;
}

interface Analytics {
  totalEarnings: number;
  totalImpressions: number;
  totalClicks: number;
  activeTokens: number;
  clickRate: number;
}

export default function DeveloperDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [placementToken, setPlacementToken] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [analytics, setAnalytics] = useState<Analytics>({
    totalEarnings: 0,
    totalImpressions: 0,
    totalClicks: 0,
    activeTokens: 0,
    clickRate: 0
  });
  const [userPlacements, setUserPlacements] = useState<any[]>([]);

  useEffect(() => {
    const boot = async () => {
      try {
        const me = await (await fetch('/api/auth/me')).json();
        if (!me.user) return router.push('/signin');
        if (me.user.role !== 'host') return router.push('/dashboard'); // 'host' is used as developer role in DB
        setUser(me.user);
        await Promise.all([
          loadAds(),
          loadAnalytics(),
          loadPlacements()
        ]);
      } catch (e) {
        router.push('/signin');
      }
    };
    boot();
  }, []);

  const loadPlacements = async () => {
    try {
      const res = await fetch('/api/placements/list');
      const data = await res.json();
      if (res.ok) {
        setUserPlacements(data.placements || []);
        // Update analytics based on placements
        const analytics = calculateAnalytics(data.placements || []);
        setAnalytics(analytics);
      }
    } catch (e) {
      console.error('Failed to load placements:', e);
    }
  };

  const loadAnalytics = async () => {
    // In a real app, this would be an API call to get aggregated analytics
    // For now, we'll calculate from placements
    try {
      const res = await fetch('/api/analytics/developer');
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to load analytics:', e);
    }
  };

  const calculateAnalytics = (placements: any[]): Analytics => {
    const total = placements.reduce((acc, p) => ({
      impressions: acc.impressions + (p.impressions || 0),
      clicks: acc.clicks + (p.clicks || 0),
      earnings: acc.earnings + (p.earnings || 0)
    }), { impressions: 0, clicks: 0, earnings: 0 });

    return {
      totalEarnings: total.earnings,
      totalImpressions: total.impressions,
      totalClicks: total.clicks,
      activeTokens: placements.filter(p => p.status === 'active').length,
      clickRate: total.impressions ? (total.clicks / total.impressions) * 100 : 0
    };
  };

  const loadAds = async () => {
    try {
      const res = await fetch('/api/ads/available');
      const data = await res.json();
      if (res.ok) setAds(data.campaigns || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchesSearch = 
        searchQuery === '' ||
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'all' ||
        (categoryFilter === 'free' && ad.isFreeAd) ||
        (categoryFilter === 'paid' && !ad.isFreeAd);

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'budget-high':
          return b.budget - a.budget;
        case 'budget-low':
          return a.budget - b.budget;
        case 'clicks':
          return b.clicks - a.clicks;
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: // 'newest'
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [ads, searchQuery, categoryFilter, sortBy]);

  const createPlacement = async (campaignId: string) => {
    try {
      const res = await fetch('/api/placements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create placement');
      setPlacementToken(data.token);
      setSelectedAd(ads.find(a => String(a._id) === String(campaignId)) || null);
      setShowModal(true);
    } catch (err: any) {
      alert(err.message || String(err));
    }
  };

  const getEmbedCode = (token: string) => {
    const base = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin) : (process.env.NEXT_PUBLIC_BASE_URL || '');
    const view = `${base}/r/${token}/view`;
    const click = `${base}/r/${token}/click`;
    return `<div id=\"metashift-ad-${token}\"></div>\n<script>\n(async()=>{const root=document.getElementById('metashift-ad-${token}');const a=document.createElement('a');a.href='${click}';a.target='_blank';const img=document.createElement('img');img.src='${view}';img.style.maxWidth='100%';a.appendChild(img);root.appendChild(a);})();\n</script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/metashift-logo.jpg" alt="MetaShift" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MetaShift</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <ConnectButton />
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Developer Dashboard</h1>
          <p className="text-gray-600">Browse ad campaigns, embed ads, and track your earnings.</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">${analytics.totalEarnings.toFixed(2)}</div>
            <div className="mt-1 text-sm text-gray-600">Lifetime earnings</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Active Ads</h3>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{analytics.activeTokens}</div>
            <div className="mt-1 text-sm text-gray-600">Live placements</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{analytics.totalImpressions.toLocaleString()}</div>
            <div className="mt-1 text-sm text-gray-600">Ad impressions</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Click Rate</h3>
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{analytics.clickRate.toFixed(2)}%</div>
            <div className="mt-1 text-sm text-gray-600">Average CTR</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search ads by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Ads</option>
                <option value="free">Free Ads</option>
                <option value="paid">Paid Ads</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
                <option value="clicks">Most Clicked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          {filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || categoryFilter !== 'all'
                  ? 'No ads match your filters'
                  : 'No ads available right now'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later or ask advertisers to post campaigns.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAds.map((ad: Campaign) => (
                <div key={String(ad._id)} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all group">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title || 'creative'} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                    />
                    {ad.isFreeAd && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Free Ad
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{ad.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ad.description}</p>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-semibold">${ad.budget.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="text-sm font-semibold">{ad.impressions?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clicks</p>
                        <p className="text-sm font-semibold">{ad.clicks?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => createPlacement(String(ad._id))} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all text-sm"
                      >
                        Insert Ad
                      </button>
                      <a 
                        href={ad.targetUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                      >
                        Preview
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && placementToken && selectedAd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Embed Snippet</h3>
                <button onClick={() => { setShowModal(false); setPlacementToken(null); setSelectedAd(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <p className="text-gray-600 mb-4">Copy this snippet and paste it where you want this ad to appear on your site.</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
                <pre>{getEmbedCode(placementToken)}</pre>
              </div>
              <div className="flex gap-3">
                <button onClick={() => copyToClipboard(getEmbedCode(placementToken!))} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold">Copy</button>
                <a href={selectedAd.targetUrl} target="_blank" rel="noreferrer" className="px-6 py-3 border rounded-lg">Visit Ad Target</a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
