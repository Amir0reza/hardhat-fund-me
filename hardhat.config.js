require("@nomicfoundation/hardhat-toolbox")
require("dotenv/config")
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
const fs = require("fs-extra")
const ethers = require("ethers")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL.toString()

const encryptedJson = fs.readFileSync("./encrypted-publicTest.json", "utf8")

let PRIVATE_KEY
if (process.env.WAL_PASS) {
  PRIVATE_KEY = new ethers.Wallet.fromEncryptedJsonSync(encryptedJson, process.env.WAL_PASS).privateKey
} else {
  PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
}

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

const config = {
  solidity: {
    compilers: [
      {version: "0.8.8"},
      {version: "0.6.6"},
    ],
  },
  defaultNetwork: "localhost",
  networks: {
    hardhat: {},
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    // outputFile: "gas-report.txt",
    // noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      5: 0, // ==> for example for goerli chainId it's second account
    },
  },
}

module.exports = config