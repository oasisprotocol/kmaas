import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-ethers"
import "@oasisprotocol/sapphire-hardhat"
import "dotenv/config"
import "hardhat-contract-sizer"
import { HardhatUserConfig } from "hardhat/config"
import { HDAccountsUserConfig } from "hardhat/types"

import "./scripts/deploy"
import "./scripts/generate"

const mnemonic = process.env.MNEMONIC
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file")
}

const accounts: HDAccountsUserConfig = {
  mnemonic,
  count: 100,
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.8.24" }],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      metadata: {
        bytecodeHash: "none",
      },
      evmVersion: "paris",
      viaIR: true
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    sapphire: {
      url: process.env.SAPPHIRE_RPC_URL || "https://sapphire.oasis.io",
      chainId: 0x5afe,
      accounts,
    },
    "sapphire-testnet": {
      url:
        process.env.SAPPHIRE_TESTNET_RPC_URL ||
        "https://testnet.sapphire.oasis.io",
      chainId: 0x5aff,
      accounts,
    },
    "sapphire-localnet": {
      url: process.env.SAPPHIRE_LOCALNET_RPC_URL || "http://localhost:8545",
      chainId: 0x5afd,
      accounts,
    },
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  mocha: {
    timeout: 20000,
  },
  sourcify: {
    enabled: true,
  },
}

export default config
