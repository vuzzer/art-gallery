const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with: ${deployer.address}`);

  const factory = await ethers.getContractFactory("NFTMarketPlace");
  const proxy = await upgrades.deployProxy(factory, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const ownerAddress = deployer.address;
  const contractName = factory.contractName;

  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const filePath = path.join(outputDir, `NFTMarketPlace.json`);

  const data = {
    constract: contractName,
    proxyAddress,
    ownerAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );

  console.log(`Proxy deployed to: ${proxyAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
