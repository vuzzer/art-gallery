const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { upgrades } = require("hardhat");

describe('NFTMarketPlace', function(){
    const uri =  "ipfs://token-uri";

    async function deployNFTMarketPlace(){
        const [owner, otherAccount, addr2] = await ethers.getSigners();
        const factoryNFTMarketPlace = await ethers.getContractFactory("NFTMarketPlace")
        const proxyNFTMarketPlace = await upgrades.deployProxy(factoryNFTMarketPlace, [], {initializer: "initialize"})
        
        await proxyNFTMarketPlace.waitForDeployment();
        return {owner, otherAccount, nftMarketPlace: proxyNFTMarketPlace, addr2}
    }

    describe('Deployment', function(){
        it("Should set the right owner", async function() {
            const {nftMarketPlace, owner} = await loadFixture(deployNFTMarketPlace)
            expect(await nftMarketPlace.owner()).to.equal(owner.address);
        });
    });

    describe('MintAndList', function(){
        it("Should mint and list a new NFT", async function() {
            // Assert
            const {nftMarketPlace, owner} = await loadFixture(deployNFTMarketPlace)

            // Act
            await nftMarketPlace.connect(owner).mintAndList(uri, true);
            const listing = await nftMarketPlace.listings(0)
            const tokenURI = await nftMarketPlace.tokenURI(0)

            // Verify
            expect(listing.seller).to.equal(owner.address)
            expect(listing.isListed).to.be.true
            expect(tokenURI).to.equal(uri)
        })

        it("Should fail if uri is mint more than once", async function() {
            // Assert
            const {nftMarketPlace, owner} = await loadFixture(deployNFTMarketPlace)

            // Act
            await nftMarketPlace.connect(owner).mintAndList(uri, true);

            // Verify
            await expect(nftMarketPlace.connect(owner).mintAndList(uri, true)
        ).to.revertedWith("URI already exists");
        })
    })

    describe('buyNFT', function(){
        it('Should allow NFT purchase and transfer ownership', async function(){
            // Assert
            const {nftMarketPlace, owner, otherAccount} = await loadFixture(deployNFTMarketPlace)
            const price = 1_000_000_000;

            // Act
            await nftMarketPlace.mintAndList(uri, true) // Mint and list

            // Send From otherAccount
            await expect(nftMarketPlace.connect(otherAccount)
            .buyNFT(0, price, {value: price}) )
            .to.changeEtherBalances(
                [otherAccount, owner],
            [-price, price]
            )

            // New owner
            expect(await nftMarketPlace.ownerOf(0)).to.equal(otherAccount.address)

            // Listing seller is updated
            const listing = await nftMarketPlace.listings(0)
            expect(listing.seller).to.equal(otherAccount.address);
        });

        it("Should fail if incorrect price is sent", async function(){
            // Assert
            const {nftMarketPlace, otherAccount} = await loadFixture(deployNFTMarketPlace)
            const expectedPrice = 7_000_000_000;
            const wrongPrice = 1_000_000_000;

            // Act
            await nftMarketPlace.mintAndList(uri, true)

            // Verify
            await expect(nftMarketPlace.connect(otherAccount).buyNFT(0, expectedPrice, {value: wrongPrice})
        ).to.be.revertedWith("Incorrect ETH amount");
        })

        it("Should fail if NFT is not listed", async function(){
            // Assert
            const {nftMarketPlace, otherAccount} = await loadFixture(deployNFTMarketPlace)
            const price = 1_000_000_000;

            // Act
            await nftMarketPlace.mintAndList(uri, false)

            // Verify
            await expect(nftMarketPlace.connect(otherAccount).buyNFT(0, price, {value: price} )
        ).to.be.revertedWith("NFT not listed for sale")
        })

        it("Should fail if seller is no longer the owner", async function(){
            // Assert
            const {nftMarketPlace, otherAccount, owner, addr2} = await loadFixture(deployNFTMarketPlace)
            const price = 1_000_000_000;

            // Act
            await nftMarketPlace.mintAndList(uri, true)
            await nftMarketPlace.transferFrom(owner.address, addr2.address, 0)

            // Verify
            await expect(nftMarketPlace.connect(otherAccount).buyNFT(0, price, {value: price} )
        ).to.be.revertedWith("Seller is not the owner anymore");
        })
    })
    describe("isMinted", function() {
        it("Should return false when nft is not minted", async function(){
            // Assert
            const {nftMarketPlace} = await loadFixture(deployNFTMarketPlace)
            
            // Act
            const output = await nftMarketPlace.isMinted(uri);

            // Verify
            expect(output).to.be.false;
        })
    })
});