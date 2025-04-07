const { ethers } = require("ethers");
const fs = require("fs");

// 1. Configure un provider Sepolia
const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/bTOfaEEYDOiFt2DadMAlh59nmVrHwUUh"); // ou Alchemy ou Ankr

// 2. Lis ABI & adresse
const abi = JSON.parse(fs.readFileSync("./artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json","utf-8"))
const deployed = JSON.parse(fs.readFileSync("./ignition/deployments/gamma/deployed_addresses.json", "utf-8"));
const address = deployed["LockModule#NFTMarketPlace"];

// 3. Instancie le contrat (read-only)
const contract = new ethers.Contract(address, abi.abi, provider);

// 4. Appelle la méthode
async function main() {
  const counter = await contract.tokenCounter();
  console.log("Token Counter:", counter.toString());
  const minted = await contract.isMinted("test");
  console.log("Is minted:", minted);
}

main().catch(console.error);