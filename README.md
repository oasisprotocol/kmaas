# 🔑 KMaaS - Key Management as a Service

A suite of smart contracts for identity management and permissioned signing on the EVM-based blockchains, leveraging the Oasis Sapphire platform.

## Overview

This project provides a set of contracts for managing identities, permissions, and secure signing capabilities. It includes:

- **Account**: Base contract for identity management.
- **AccountWithSymKey**: Extends `Account` with symmetric key encryption.
- **AccountWithPermKey**: Extends `Account` with permissioned signing for specific contracts.
- **AccountFactory**: Factory for deploying new `Account` instances.

## Features

- **Identity Management**: Manage permissions and signing capabilities for identities.
- **Symmetric Key Encryption**: On-chain/off-chain encryption using symmetric keys.
- **Permissioned Signing**: Restrict signing capabilities to specific contracts.
- **Factory Pattern**: Deploy new accounts with ease.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oasisprotocol/kmaas.git
   cd kmaas
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Usage

### Compile Contracts

Compile the smart contracts using Hardhat:

```bash
pnpm hardhat compile
```

### Deploy Contracts

Deploy contracts to a network:

```bash
pnpm hardhat deploy --network <network-name>
```

## Configuration

Ensure you have a `.env` file with the following variables:

```txt
MNEMONIC=<your-mnemonic>
SAPPHIRE_RPC_URL=<sapphire-rpc-url>
SAPPHIRE_TESTNET_RPC_URL=<sapphire-testnet-rpc-url>
SAPPHIRE_LOCALNET_RPC_URL=<sapphire-localnet-rpc-url>
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Oasis Protocol](https://oasisprotocol.org/)
- [OpenZeppelin](https://openzeppelin.com/)
