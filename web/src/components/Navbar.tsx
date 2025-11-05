'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                MetaShift
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-8">
            <Link 
              href="/advertiser"
              className={`${
                pathname === '/advertiser' 
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              } px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
            >
              Advertisers
            </Link>
            <Link 
              href="/host"
              className={`${
                pathname === '/host'
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              } px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
            >
              Hosts
            </Link>
            <Link 
              href="/dashboard"
              className={`${
                pathname === '/dashboard'
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              } px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}