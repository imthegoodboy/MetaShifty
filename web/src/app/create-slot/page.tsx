"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function CreateAdSlot() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    width: '728',
    height: '90',
    pricePerImpression: '1.00',
  });

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
        setLoading(false);
      })
      .catch(() => router.push('/signin'));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const res = await fetch('/api/slots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create ad slot');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/host');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const commonSizes = [
    { name: 'Leaderboard', width: 728, height: 90 },
    { name: 'Banner', width: 468, height: 60 },
    { name: 'Medium Rectangle', width: 300, height: 250 },
    { name: 'Large Rectangle', width: 336, height: 280 },
    { name: 'Skyscraper', width: 120, height: 600 },
    { name: 'Wide Skyscraper', width: 160, height: 600 },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/host" className="flex items-center gap-3">
            <Image src="/images/metashift-logo.svg" alt="MetaShift" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MetaShift
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/host" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Ad Slot NFT</h1>
          <p className="text-gray-600">Mint an NFT ad slot and start earning from your website traffic</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-semibold">Ad slot created successfully! Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Slot Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Homepage Header Banner"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe where this ad will appear on your website..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                required
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ad Size (pixels)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {commonSizes.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, width: size.width.toString(), height: size.height.toString() })}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      formData.width === size.width.toString() && formData.height === size.height.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-bold">{size.name}</div>
                    <div className="text-xs text-gray-600">{size.width} × {size.height}</div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    required
                    min="50"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Width"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    required
                    min="50"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price per 1,000 Impressions (CPM in USD) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.pricePerImpression}
                onChange={(e) => setFormData({ ...formData, pricePerImpression: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.00"
              />
              <p className="mt-2 text-sm text-gray-500">
                Suggested range: $0.50 - $5.00 per 1,000 impressions
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">💡 Earnings Calculator</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>With 10,000 monthly visitors, you could earn:</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(parseFloat(formData.pricePerImpression) * 10).toFixed(2)}/month
                </p>
                <p className="text-xs text-gray-600">Based on your CPM rate of ${formData.pricePerImpression} per 1,000 views</p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating Ad Slot...' : 'Create Ad Slot'}
              </button>
              <Link
                href="/host"
                className="px-8 py-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 Next Steps After Creating</h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Copy the JavaScript embed code from your dashboard</li>
            <li>Add it to your website where you want ads to appear</li>
            <li>Get paid automatically when ads are displayed</li>
            <li>Track earnings in real-time on your dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
