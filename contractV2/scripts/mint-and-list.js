const {ethers} = require("hardhat")
const fs = require("fs")

async function main(){
    // Read deployed contract address from file
    const deployed = JSON.parse(fs.readFileSync("./deployments/NFTMarketPlace.json", "utf-8"))

    // Read tokenURIs from local file
    const nftData = JSON.parse(fs.readFileSync("./uris.json", "utf-8"))
    const MAX_SUPPLY = 6;

      // Get deployed contract address
    const contractAddress = deployed["proxyAddress"];
    if (!contractAddress) {
        throw new Error("Contract address not found in deployed_addresses.json");
      }

      // Get contract instance
    const NFTMarketPlace = await ethers.getContractFactory("NFTMarketPlace")
    const contract = await NFTMarketPlace.attach(contractAddress)

    // Limit to 5 NFTs
    const limit = Math.min(nftData.length, MAX_SUPPLY);
    for (let i = 0; i < limit; i++) {
        const { tokenURI } = nftData[i];
        console.log(`Minting and listing NFT ${i + 1}/${limit}...`);
    
        const tx = await contract.mintAndList(tokenURI, true);
        await tx.wait();
    
        console.log(`✅ NFT ${i + 1} minted and listed: ${tokenURI}`);
      }
    
      console.log("🎉 Done minting limited NFTs.");
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});