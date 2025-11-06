# MetaShift - Decentralized Ad-to-Earn Platform

## Overview
MetaShift is a Web3 advertising network where users get paid crypto for viewing or hosting ads. It's like Brave Browser's BAT but fully decentralized, Polygon-powered, and built for the Web3 ecosystem.
 
## Project Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Blockchain**: Polygon Network (smart contracts deployed)
- **Wallet Integration**: RainbowKit + wagmi + viem
- **Database**: MongoDB (user management, campaigns, ad slots)
- **External Services**: 
  - SideShift API (crypto swaps for instant payouts)
  - The Graph (on-chain analytics and ad tracking)
  - WalletConnect (wallet connection)

### Directory Structure
- `web/` - Next.js frontend application
  - `src/app/` - App router pages and API routes
  - `src/components/` - Reusable React components
  - `src/lib/` - Utility functions (auth, database, wallet)
  - `src/types/` - TypeScript type definitions
- `contracts/` - Solidity smart contracts (AdSlotNFT, MetaShiftAdManager)
- `subgraph/` - The Graph integration for analytics

### User Roles
1. **Advertisers**: Create and manage ad campaigns, track analytics, get 5 free ads on signup
2. **Hosts**: Mint NFT ad slots, embed ads on their sites, earn passive income
3. **Viewers**: Earn crypto rewards for viewing ads (future feature)

### Key Features
- Email/password authentication with JWT tokens
- Wallet connection required for blockchain transactions
- Role-based dashboards with real-time analytics
- Smart contract integration for ad payments and slot management
- Free ad credits for new advertisers (5 ads)
- Instant crypto payouts via SideShift API
- On-chain ad verification and tracking

## Environment Variables
All required environment variables are configured in Replit Secrets:
- `MONGO_URL` - MongoDB connection string
- `WEB_SECRET` - JWT signing secret
- `NEXT_PUBLIC_WALLETCONNECT_ID` - WalletConnect project ID
- `POLYGON_RPC` - Polygon RPC endpoint
- `SERVER_SIGNER_KEY` - Server wallet private key
- `SIDESHIFT_API_KEY` - SideShift API key
- `NEXT_PUBLIC_SLOT_ADDRESS` - AdSlotNFT contract address
- `NEXT_PUBLIC_MANAGER_ADDRESS` - MetaShiftAdManager contract address
- `NEXT_PUBLIC_BASE_URL` - Application base URL

## Running the Project
- Development: `cd web && npm run dev` (runs on port 5000)
- Production Build: `cd web && npm run build`
- Production Start: `cd web && npm run start`

## Deployment
Configured for Replit autoscale deployment with build and start commands in deployment configuration.

## Security Practices
- Passwords hashed with scrypt
- JWT tokens with HMAC-SHA256 signing
- HTTP-only cookies for session management
- Client/server separation for sensitive operations
- Server-side signing for blockchain transactions
- Environment variables for all secrets

## Next Steps / Future Enhancements
- Integrate The Graph for real-time on-chain analytics
- Implement campaign creation and management
- Add ad slot minting functionality
- Build viewer rewards system
- Add AI-powered ad verification
- Implement rate limiting and CSRF protection
ss