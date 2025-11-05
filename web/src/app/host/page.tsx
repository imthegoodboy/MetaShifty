"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface AdSlot {
  _id: string;
  name: string;
  description: string;
  websiteUrl: string;
  dimensions: { width: number; height: number };
  pricePerImpression: number;
  status: string;
  totalEarned: number;
  totalImpressions: number;
}

export default function HostDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/signin');
          return;
        }
        if (data.user.role !== 'host') {
          router.push('/dashboard');
          return;
        }
        setUser(data.user);
        loadAdSlots();
      })
      .catch(() => router.push('/signin'));
  }, []);

  const loadAdSlots = async () => {
    try {
      const res = await fetch('/api/slots');
      const data = await res.json();
      
      if (res.ok) {
        setAdSlots(data.slots || []);
        setTotalEarned(data.stats?.totalEarned || 0);
      }
    } catch (err) {
      console.error("Failed to load ad slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getEmbedCode = (slotId: string) => {
    return `<div id="metashift-ad-${slotId}"></div>
<script src="https://cdn.metashift.io/ads.js"></script>
<script>
  MetaShift.renderAd('${slotId}');
</script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Embed code copied to clipboard!');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const totalImpressions = adSlots.reduce((sum, slot) => sum + (slot.totalImpressions || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/metashift-logo.jpg" alt="MetaShift" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MetaShift
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <ConnectButton />
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
          <p className="text-gray-600">Monetize your website traffic with decentralized advertising</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold opacity-90">Total Earnings</h3>
              </div>
              <p className="text-4xl font-bold">${totalEarned.toFixed(2)}</p>
              <p className="text-blue-100 mt-1 text-sm">Instant payouts to wallet</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h3 className="text-lg font-semibold opacity-90">Total Views</h3>
              </div>
              <p className="text-4xl font-bold">{totalImpressions.toLocaleString()}</p>
              <p className="text-blue-100 mt-1 text-sm">Across all ad slots</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-lg font-semibold opacity-90">Avg CPM Rate</h3>
              </div>
              <p className="text-4xl font-bold">
                ${adSlots.length > 0 
                  ? ((adSlots.reduce((sum, s) => sum + s.pricePerImpression, 0) / adSlots.length) * 1000).toFixed(2) 
                  : '0.00'}
              </p>
              <p className="text-blue-100 mt-1 text-sm">Per 1,000 impressions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Total Slots</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{adSlots.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Active</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {adSlots.filter(s => s.status === 'occupied').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Available</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {adSlots.filter(s => s.status === 'available').length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Fill Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {adSlots.length > 0 
                ? Math.round((adSlots.filter(s => s.status === 'occupied').length / adSlots.length) * 100)
                : 0}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Ad Slots</h2>
            <Link
              href="/create-slot"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              + Create New Slot
            </Link>
          </div>

          {adSlots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No ad slots yet</h3>
              <p className="text-gray-600 mb-6">Create your first ad slot NFT and start earning passive income from your website!</p>
              <div className="max-w-2xl mx-auto mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    How it works:
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Create an NFT ad slot representing space on your website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Embed our simple JavaScript snippet where you want ads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Earn automatically when ads are displayed to your visitors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <span>Get paid instantly in crypto via Polygon smart contracts</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link
                href="/create-slot"
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create Your First Ad Slot
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adSlots.map((slot) => (
                <div key={slot._id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{slot.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{slot.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          {slot.dimensions.width}×{slot.dimensions.height}px
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          {slot.websiteUrl}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      slot.status === 'occupied' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {slot.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">CPM Rate</p>
                      <p className="text-lg font-semibold text-gray-900">${(slot.pricePerImpression * 1000).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Views</p>
                      <p className="text-lg font-semibold text-gray-900">{(slot.totalImpressions || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Earned</p>
                      <p className="text-lg font-semibold text-gray-900">${slot.totalEarned.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setShowEmbedCode(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all text-sm"
                  >
                    Get Embed Code
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showEmbedCode && selectedSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Embed Code</h3>
                <button
                  onClick={() => {
                    setShowEmbedCode(false);
                    setSelectedSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-4">Copy this code and paste it into your website where you want the ad to appear:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
                <pre>{getEmbedCode(selectedSlot._id)}</pre>
              </div>
              <button
                onClick={() => copyToClipboard(getEmbedCode(selectedSlot._id))}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Powered by Leading Web3 Technology</h3>
          <p className="text-gray-600 mb-6">Secure, transparent, and instant payouts on the blockchain</p>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <Image src="/images/polygon-logo.jpg" alt="Polygon" width={32} height={32} className="rounded" />
              <span className="text-sm font-medium text-gray-700">Polygon Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src="/images/sideshift-logo.jpg" alt="SideShift" width={32} height={32} className="rounded" />
              <span className="text-sm font-medium text-gray-700">SideShift Swaps</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src="/images/thegraph-logo.jpg" alt="The Graph" width={32} height={32} className="rounded" />
              <span className="text-sm font-medium text-gray-700">The Graph Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
