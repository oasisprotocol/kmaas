import '@oasisprotocol/sapphire-hardhat';
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const TEST_HDWALLET = {
    mnemonic: "measure pigeon simple trend lyrics grab floor airport wreck lend chronic romance",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
    passphrase: "",
};

require('dotenv').config();

const accounts = [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2]

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.19',
        settings: {
            optimizer: {
                enabled: true
            }
        }
    },
    networks: {
        'hardhat': {
            chainId: 1337,
            hardhat_local: {
                url: 'http://127.0.0.1:8545/',
            }
        },
//         'sapphire': {
//             url: 'https://sapphire.oasis.io',
//             chainId: 0x5afe,
//             accounts,
//         },
        'sapphire-testnet': {
            url: 'https://testnet.sapphire.oasis.dev',
            chainId: 0x5aff,
            accounts,
        },
        'sapphire-localnet': {
            url: 'http://localhost:8545',
            chainId: 0x5afd,
            accounts,
        }
    }
};

export default config;