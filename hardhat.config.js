require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");
require("dotenv").config();

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.ETHER_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.19",
  solidity: {
    compilers: [{ version: "0.8.19" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545/",
    //   chainId: 31337,
    // },
  },
  etherscan: {
    apiKey: API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    token: "MATIC",
  },
};
