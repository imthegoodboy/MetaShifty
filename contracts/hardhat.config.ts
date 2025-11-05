import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const ALCHEMY_POLYGON_RPC = process.env.ALCHEMY_POLYGON_RPC || "";
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || "0x";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    amoy: {
      // Polygon Amoy testnet
      url: ALCHEMY_POLYGON_RPC,
      accounts: POLYGON_PRIVATE_KEY !== "0x" ? [POLYGON_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY || "",
  },
};

export default config;



