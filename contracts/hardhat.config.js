/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../.env' });

// Default private key for development (Hardhat's default account)
const DEFAULT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Get private key from environment variable or use default
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Hardhat local network
    hardhat: {
      chainId: 31337,
    },
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Goerli testnet
    goerli: {
      url: process.env.ETH_RPC_URL || "https://goerli.infura.io/v3/your-api-key",
      accounts: [PRIVATE_KEY],
    },
    // Sepolia testnet
    sepolia: {
      url: process.env.ETH_RPC_URL || "https://sepolia.infura.io/v3/your-api-key",
      accounts: [PRIVATE_KEY],
    },
    // Mainnet
    mainnet: {
      url: process.env.ETH_RPC_URL || "https://mainnet.infura.io/v3/your-api-key",
      accounts: process.env.WALLET_PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};