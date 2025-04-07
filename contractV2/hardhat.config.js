require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
const {vars} = require("hardhat/config")

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY")
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  gasReporter:{
    enabled: true,
    currency: 'USD'
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
      timeout: 100000
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};
