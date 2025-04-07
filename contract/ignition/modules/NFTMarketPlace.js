const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LockModule", (m) => {
  const nftMarketPlace = m.contract("NFTMarketPlace");

  return { nftMarketPlace };
});