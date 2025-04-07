// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @dev Represents a single NFT listing on the marketplace
struct Listing {
    address seller;    // Current owner of the token
    uint256 tokenId;   // Unique ID of the NFT
    bool isListed;     // Whether the token is currently available for sale
}

/// @title NFT Marketplace Contract
/// @author @BienvenuKouassi
/// @notice Allows the owner to mint and list NFTs, and users to purchase them with ETH
/// @dev Inherits from ERC721URIStorage and Ownable
contract NFTMarketPlace is ERC721URIStorageUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    /// @notice Tracks the number of NFTs minted
    uint256 public tokenCounter;

    /// @dev Keeps track of which URIs have been used to prevent duplicates
    mapping(string => bool) private uriUsed;

    /// @notice Maps each tokenId to its Listing metadata
    mapping(uint256 => Listing) public listings;

    /// @notice Emitted when a new NFT is purchased
    event NFTPurchased(address indexed buyer, uint256 indexed tokenId, uint256 paid);

    /// @notice Emitted when a new NFT is minted and listed
    event NFTMinted(uint256 indexed tokenId, string uri, address indexed owner);

    /// @notice Emitted when the listing status of an NFT is updated
    event StockUpdated(uint256 indexed tokenId, bool isListed);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("Art Galery", "AGNFT");
        __ERC721URIStorage_init();
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        tokenCounter = 0;
    }

    /// @notice Mints a new NFT and optionally lists it for sale
    /// @dev Prevents minting the same URI multiple times
    /// @param uri The token metadata URI (e.g., IPFS URL)
    /// @param isStock Whether the NFT should be immediately listed
    function mintAndList(string memory uri, bool isStock) external onlyOwner {
        require(!uriUsed[uri], "URI already exists"); // Ensure unique asset

        uint256 newTokenId = tokenCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, uri);
        uriUsed[uri] = true;

        listings[newTokenId] = Listing(msg.sender, newTokenId, isStock);

        emit NFTMinted(newTokenId, uri, msg.sender);

        tokenCounter++;
    }

    /// @notice Updates the listing status of a given NFT
    /// @param tokenId The ID of the token to update
    /// @param newStatus The new listing status (true = listed, false = unlisted)
    function updateStock(uint256 tokenId, bool newStatus) external onlyOwner {
        listings[tokenId].isListed = newStatus;
        emit StockUpdated(tokenId, newStatus);
    }

    /// @notice Allows a user to purchase a listed NFT
    /// @param tokenId The ID of the NFT to purchase
    /// @param expectedPrice The expected amount of ETH to be paid
    function buyNFT(uint256 tokenId, uint256 expectedPrice) external payable {
        Listing memory listing = listings[tokenId];

        require(listing.isListed, "NFT not listed for sale");
        require(ownerOf(tokenId) == listing.seller, "Seller is not the owner anymore");
        require(msg.value == expectedPrice, "Incorrect ETH amount");

        // Transfer ETH to the seller
        (bool sucess, ) = payable(listing.seller).call{value: msg.value}("");
        require(sucess, "ETH transfer failed");

        // Transfer NFT ownership to the buyer
        _transfer(listing.seller, msg.sender, tokenId);

        // Update seller info for listings
        listings[tokenId].seller = msg.sender;

        emit NFTPurchased(msg.sender, tokenId, msg.value);
    }

    /// @notice Allows the contract owner to withdraw any ETH stored in the contract
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /// @notice Check whether a given tokenURI has already been minted
    /// @param uri The token URI to check (e.g. IPFS link)
    /// @return True if the URI has already been used, false otherwise
    function isMinted(string memory uri) public view returns (bool) {
        return uriUsed[uri];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
