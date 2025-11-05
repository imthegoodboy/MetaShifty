"use client";
import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
                <Image src="/images/metashift-logo.jpg" alt="MetaShift" width={40} height={40} />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              MetaShift
            </span>
          </div>
          <div className="flex gap-4">
            {user ? (
              <Link
                href={user.role === 'advertiser' ? '/dashboard' : '/host'}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-6 py-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            Decentralized Ad-to-Earn
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-4">
            Get paid crypto for viewing ads. Earn passive income hosting ads.
          </p>
          <p className="text-lg text-gray-600 mb-8">
            Powered by Polygon • Instant Swaps via SideShift • AI-Verified Ads
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Start Earning Now
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-600 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Learn More
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">For Advertisers</h3>
            <p className="text-gray-600 mb-4">Launch transparent Web3 ad campaigns. Track every impression on-chain. Get 5 free ads when you sign up!</p>
            <div className="text-purple-600 font-semibold">✓ 5 Free Ads</div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">For Hosts</h3>
            <p className="text-gray-600 mb-4">Monetize your website or dApp. Mint NFT ad slots. Earn passive income automatically paid to your wallet.</p>
            <div className="text-blue-600 font-semibold">✓ Instant Payouts</div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100 hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">For Viewers</h3>
            <p className="text-gray-600 mb-4">Earn crypto rewards for viewing ads. Auto-swap to any token via SideShift. Your attention has value!</p>
            <div className="text-green-600 font-semibold">✓ Watch to Earn</div>
          </div>
        </div>

        <div id="how-it-works" className="bg-white rounded-3xl p-12 shadow-2xl mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            How MetaShift Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-purple-600">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Connect</h3>
              <p className="text-gray-600">Create account with email and connect your Polygon wallet. Choose your role: Advertiser or Host.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-blue-600">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Launch or Host Ads</h3>
              <p className="text-gray-600">Advertisers create campaigns. Hosts mint NFT ad slots and embed them on their sites.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-green-600">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn & Track</h3>
              <p className="text-gray-600">View real-time analytics. Get paid in crypto automatically via smart contracts.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white text-center mb-20">
          <h2 className="text-3xl font-bold mb-4">Built on Trusted Web3 Infrastructure</h2>
          <p className="text-xl mb-8 text-purple-100">Deployed on Polygon • Powered by SideShift • Analytics by The Graph</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="bg-white rounded-xl p-6 w-40 h-32 flex flex-col items-center justify-center">
              <Image src="/images/polygon-logo.png" alt="Polygon" width={80} height={80} className="mb-2" />
              <p className="text-sm text-gray-700 font-semibold">Polygon</p>
            </div>
            <div className="bg-white rounded-xl p-6 w-40 h-32 flex flex-col items-center justify-center">
              <Image src="/images/sideshift-logo.png" alt="SideShift" width={80} height={80} className="mb-2" />
              <p className="text-sm text-gray-700 font-semibold">SideShift</p>
            </div>
            <div className="bg-white rounded-xl p-6 w-40 h-32 flex flex-col items-center justify-center">
              <Image src="/images/thegraph-logo.svg" alt="The Graph" width={80} height={80} className="mb-2" />
              <p className="text-sm text-gray-700 font-semibold">The Graph</p>
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">Join the decentralized advertising revolution today!</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        )}
      </section>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 MetaShift. Decentralized advertising powered by Polygon.</p>
        </div>
      </footer>
    </div>
  );
}
