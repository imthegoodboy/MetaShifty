# MetaShift Contracts

Network: Polygon Amoy (testnet)
- `AdSlotNFT`: 0x5771b9368a1d5beB88861b7bb4C44c467966058f
- `MetaShiftAdManager`: 0xA5F95992d40782f3844e7B8BA5117fe05c4E530f

## Overview
- `AdSlotNFT.sol`
  - ERC‑721 representing a host‑owned ad slot (e.g., “header banner” on a site).
  - Owner may update per‑slot metadata URI.
- `MetaShiftAdManager.sol`
  - Creates campaigns, holds escrowed budget, pays per verified view.
  - Default split per view price: 70% Host / 20% Viewer / 10% Treasury.

## Key Functions
- AdSlotNFT
  - `mintSlot(address to, string slotURI)`: Owner mints a new slot NFT to `to`.
  - `setSlotURI(uint256 tokenId, string slotURI)`: Owner or token owner can update metadata.
- MetaShiftAdManager
  - `createCampaign(uint256 slotId, string creativeURI, string clickURL, address paymentToken, uint256 pricePerView)` → `id`
  - `fundCampaign(uint256 id, uint256 amount)` payable or via ERC‑20
  - `setCampaignStatus(uint256 id, bool active)`
  - `payView(uint256 id, bytes32 viewId, address viewer)`

## Events
- `CampaignCreated(uint256 id, address advertiser, uint256 slotId)`
- `CampaignFunded(uint256 id, uint256 amount)`
- `CampaignStatus(uint256 id, bool active)`
- `ViewPaid(uint256 id, bytes32 viewId, address host, address viewer, uint256 amount)`

## Payout Math
Let `ppv = pricePerView` and basis points (BPS) = 10000
- Host = `ppv * 7000 / 10000`
- Viewer = `ppv * 2000 / 10000`
- Treasury = `ppv - host - viewer`

## Payment Tokens
- `paymentToken == address(0)` → native MATIC (Polygon).
- Else, ERC‑20 transfers are used for fund and payouts.

## View Verification
- Off‑chain service constructs unique `viewId = keccak256(campaignId, viewer, nonce)` and calls `payView`.
- Prevents double‑pay via `viewPaid[viewId]` flag.
- In production, secure this via oracle/attestation + anti‑fraud.

## Deploy / Verify
- Deploy script: `contracts/scripts/deploy.ts`
- Network config: `contracts/hardhat.config.ts`
- Env (contracts/.env):
  - `ALCHEMY_POLYGON_RPC=...`
  - `POLYGON_PRIVATE_KEY=0x...`
  - `METASHIFT_TREASURY=0x...`
- Compile: `npx hardhat compile`
- Deploy: `npx hardhat run scripts/deploy.ts --network amoy`
- (Optional) Verify: `npx hardhat verify --network amoy <address> <constructor args...>`

## Upgrades & Governance
- Current contracts are non‑upgradeable for simplicity.
- Treasury address can be updated by `owner` in `MetaShiftAdManager`.
- Consider multisig ownership and pausable features before mainnet.

