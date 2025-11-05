// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAdSlotNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @title MetaShiftAdManager - Manages ad campaigns, views, and payouts
/// @notice Minimal viable contract for managing deposits and splitting payouts
contract MetaShiftAdManager is Ownable, ReentrancyGuard {
    struct Campaign {
        address advertiser;
        uint256 slotId; // AdSlotNFT token id target
        string creativeURI; // content pointer (IPFS/URL)
        string clickURL;
        address paymentToken; // address(0) means native MATIC
        uint256 budget; // remaining budget in smallest unit
        uint256 pricePerView; // in token units
        bool active;
    }

    IAdSlotNFT public immutable adSlotNFT;
    address public treasury;
    uint256 public constant HOST_SHARE_BP = 7000; // 70%
    uint256 public constant VIEWER_SHARE_BP = 2000; // 20%
    uint256 public constant TREASURY_SHARE_BP = 1000; // 10%
    uint256 public constant BPS = 10000;

    uint256 public nextCampaignId = 1;
    mapping(uint256 => Campaign) public campaigns; // campaignId => data

    // viewId => paid flag (simple replay-protection for off-chain verified views)
    mapping(bytes32 => bool) public viewPaid;

    event CampaignCreated(uint256 indexed id, address indexed advertiser, uint256 indexed slotId);
    event CampaignFunded(uint256 indexed id, uint256 amount);
    event CampaignStatus(uint256 indexed id, bool active);
    event ViewPaid(uint256 indexed id, bytes32 indexed viewId, address host, address viewer, uint256 amount);

    constructor(address adSlotNFT_, address initialOwner, address treasury_) Ownable(initialOwner) {
        adSlotNFT = IAdSlotNFT(adSlotNFT_);
        treasury = treasury_;
    }

    function setTreasury(address treasury_) external onlyOwner {
        treasury = treasury_;
    }

    function createCampaign(
        uint256 slotId,
        string calldata creativeURI,
        string calldata clickURL,
        address paymentToken,
        uint256 pricePerView
    ) external returns (uint256) {
        uint256 id = nextCampaignId++;
        campaigns[id] = Campaign({
            advertiser: msg.sender,
            slotId: slotId,
            creativeURI: creativeURI,
            clickURL: clickURL,
            paymentToken: paymentToken,
            budget: 0,
            pricePerView: pricePerView,
            active: true
        });
        emit CampaignCreated(id, msg.sender, slotId);
        return id;
    }

    function fundCampaign(uint256 id, uint256 amount) external payable nonReentrant {
        Campaign storage c = campaigns[id];
        require(c.advertiser != address(0), "Invalid campaign");
        require(c.active, "Inactive");

        if (c.paymentToken == address(0)) {
            // Native MATIC
            require(msg.value == amount, "Bad msg.value");
            c.budget += amount;
        } else {
            require(msg.value == 0, "Unexpected value");
            IERC20(c.paymentToken).transferFrom(msg.sender, address(this), amount);
            c.budget += amount;
        }
        emit CampaignFunded(id, amount);
    }

    function setCampaignStatus(uint256 id, bool active_) external {
        Campaign storage c = campaigns[id];
        require(msg.sender == c.advertiser || msg.sender == owner(), "Not authorized");
        c.active = active_;
        emit CampaignStatus(id, active_);
    }

    /// @notice Pay a verified view. Off-chain service must pre-verify and call this.
    /// @dev viewId should include campaignId+viewer+nonce to be unique and prevent double-pay.
    function payView(uint256 id, bytes32 viewId, address viewer) external nonReentrant {
        require(!viewPaid[viewId], "Already paid");
        Campaign storage c = campaigns[id];
        require(c.active && c.pricePerView > 0 && c.budget >= c.pricePerView, "Insufficient");

        address host = adSlotNFT.ownerOf(c.slotId);

        uint256 hostAmount = (c.pricePerView * HOST_SHARE_BP) / BPS;
        uint256 viewerAmount = (c.pricePerView * VIEWER_SHARE_BP) / BPS;
        uint256 treasuryAmount = c.pricePerView - hostAmount - viewerAmount;

        c.budget -= c.pricePerView;
        viewPaid[viewId] = true;

        if (c.paymentToken == address(0)) {
            _safeSend(host, hostAmount);
            _safeSend(viewer, viewerAmount);
            _safeSend(treasury, treasuryAmount);
        } else {
            IERC20 token = IERC20(c.paymentToken);
            require(token.transfer(host, hostAmount), "host xfer failed");
            require(token.transfer(viewer, viewerAmount), "viewer xfer failed");
            require(token.transfer(treasury, treasuryAmount), "treasury xfer failed");
        }

        emit ViewPaid(id, viewId, host, viewer, c.pricePerView);
    }

    function _safeSend(address to, uint256 amount) internal {
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "send failed");
    }
}


