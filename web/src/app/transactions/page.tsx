"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NetworkStatus from '../../components/NetworkStatus';
import { TableRowSkeleton } from '../../components/Skeleton';

interface Transaction {
  type: string;
  txHash: string | null;
  amount: number;
  currency: string;
  description: string;
  status: string;
  timestamp: string;
  direction: 'in' | 'out';
}

interface Summary {
  totalEarnings: number;
  totalSpent: number;
  netBalance: number;
  transactionCount: number;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    const boot = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (!meData.user) {
          router.push('/signin');
          return;
        }
        setUser(meData.user);

        const txRes = await fetch('/api/transactions');
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
        setSummary(txData.summary);
      } catch (e) {
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'advertiser' ? '/dashboard' : '/host';
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.direction === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateTxHash = (hash: string | null) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const getPolygonscanUrl = (txHash: string) => {
    // Amoy testnet explorer
    return `https://amoy.polygonscan.com/tx/${txHash}`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">View your on-chain activity on Polygon Amoy testnet</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{summary.totalEarnings.toFixed(4)} MATIC</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{summary.totalSpent.toFixed(4)} MATIC</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Net Balance</span>
              </div>
              <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.netBalance >= 0 ? '+' : ''}{summary.netBalance.toFixed(4)} MATIC
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">Transactions</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{summary.transactionCount}</p>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('in')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'in'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'out'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6">Your transaction history will appear here</p>
              <Link
                href={getDashboardLink()}
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((tx, index) => (
                <div key={index} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tx.direction === 'in' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.direction === 'in' ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.direction === 'in' ? '+' : '-'}{tx.amount.toFixed(4)} {tx.currency}
                    </p>
                    {tx.txHash ? (
                      <a
                        href={getPolygonscanUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 font-mono"
                      >
                        {truncateTxHash(tx.txHash)} ↗
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Network Info */}
        <div className="mt-8 p-6 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-purple-900">Polygon Amoy Testnet</span>
          </div>
          <p className="text-sm text-purple-700">
            All transactions are on the Polygon Amoy testnet. View transactions on{' '}
            <a href="https://amoy.polygonscan.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">
              Polygonscan
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
