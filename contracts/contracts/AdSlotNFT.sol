// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AdSlotNFT - Represents an ad slot owned by a host
/// @notice Hosts mint NFTs to claim and manage ad slots across their properties
contract AdSlotNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    // Optional metadata URI per slot (e.g., site URL / placement name)
    mapping(uint256 => string) private _slotURI;

    event SlotMinted(address indexed to, uint256 indexed tokenId, string slotURI);
    event SlotURIUpdated(uint256 indexed tokenId, string slotURI);

    constructor(address initialOwner) ERC721("MetaShift AdSlot", "MSLOT") Ownable(initialOwner) {}

    function mintSlot(address to, string memory slotURI_) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _slotURI[tokenId] = slotURI_;
        emit SlotMinted(to, tokenId, slotURI_);
        return tokenId;
    }

    function setSlotURI(uint256 tokenId, string memory slotURI_) external {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender, "Not authorized");
        _slotURI[tokenId] = slotURI_;
        emit SlotURIUpdated(tokenId, slotURI_);
    }

    function slotURI(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _slotURI[tokenId];
    }
}


