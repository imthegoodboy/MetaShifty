"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import NetworkStatus from '../../components/NetworkStatus';
import { toast } from '../../lib/toast';

export default function SettingsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    walletAddress: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/signin');
          return;
        }
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          displayName: data.user.displayName || '',
          walletAddress: data.user.walletAddress || '',
        }));
        setLoading(false);
      })
      .catch(() => router.push('/signin'));
  }, [router]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address && !formData.walletAddress) {
      setFormData(prev => ({ ...prev, walletAddress: address }));
    }
  }, [isConnected, address, formData.walletAddress]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate password confirmation if changing password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters');
        }
      }

      const updatePayload: Record<string, any> = {};

      if (formData.displayName !== (user.displayName || '')) {
        updatePayload.displayName = formData.displayName;
      }

      if (formData.walletAddress !== (user.walletAddress || '')) {
        updatePayload.walletAddress = formData.walletAddress;
      }

      if (formData.newPassword) {
        updatePayload.currentPassword = formData.currentPassword;
        updatePayload.newPassword = formData.newPassword;
      }

      if (Object.keys(updatePayload).length === 0) {
        throw new Error('No changes to save');
      }

      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // Refresh user data
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.user) {
        setUser(meData.user);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'advertiser' ? '/dashboard' : '/host';
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/metashift-logo.jpg" alt="MetaShift" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              MetaShift
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <Link href={getDashboardLink()} className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <ConnectButton />
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    user.role === 'advertiser' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'advertiser' ? '📢 Advertiser' : '🏠 Host'}
                  </span>
                  {user.freeAdsRemaining > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {user.freeAdsRemaining} free ads remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Wallet Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="0x..."
                  />
                  {isConnected && address && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, walletAddress: address })}
                      className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                    >
                      Use Connected
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This address will receive your earnings on Polygon Amoy testnet
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-purple-900">Network: Polygon Amoy Testnet</span>
                </div>
                <p className="text-sm text-purple-700">
                  All transactions and earnings are on the Polygon Amoy testnet. Get test MATIC from the{' '}
                  <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">
                    Polygon Faucet
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={getDashboardLink()}
              className="px-8 py-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
