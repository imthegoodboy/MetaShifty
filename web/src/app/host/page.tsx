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
            <Image src="/images/metashift-logo.svg" alt="MetaShift" width={40} height={40} className="rounded-lg" />
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
          <p className="text-gray-600">Browse advertiser campaigns and insert a unique snippet into your site.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          {ads.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No ads available right now</h3>
              <p className="text-gray-600">Check back later or ask advertisers to post campaigns.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((ad: any) => (
                <div key={String(ad._id)} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={ad.imageUrl} alt={ad.title || 'creative'} className="w-28 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{ad.title || ad.description}</h3>
                      <p className="text-sm text-gray-600 mt-2">{ad.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Budget: {ad.budget} / Impressions: {ad.impressions || 0} / Clicks: {ad.clicks || 0}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => createPlacement(String(ad._id))} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-md">Insert</button>
                    <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="px-4 py-3 border border-gray-200 rounded-lg text-sm">Preview</a>
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
