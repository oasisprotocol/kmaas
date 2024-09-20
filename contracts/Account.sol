// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {SignatureRSV, EthereumUtils} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import {EIP155Signer} from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";
import {AccountBase, AccountFactoryBase} from "./AccountBase.sol";


/// @title A contract to create per-identity account.
contract AccountFactory is AccountFactoryBase {
    /// Logs the address of the created account on-chain
    event AccountCreated(address contractAddress);

    /// @notice Function to create a clone
    /// @param target address of master contract to clone
    function clone(address target)
        public virtual override {
        bytes20 targetBytes = bytes20(target);
        address contractAddr;
        assembly {
            let contractClone := mload(0x40)
            mstore(contractClone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(contractClone, 0x14), targetBytes)
            mstore(add(contractClone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            contractAddr := create(0, contractClone, 0x37)
        }
        require(contractAddr != address(0), "Create failed");
        emit AccountCreated(contractAddr);
    }
}

/// @title A base class for a per-identity account.
/// It can be extended to include additional data, for example a symmetric
/// key for encrypting and decryption off-chain data.
contract Account is AccountBase {
    bool initialized;

    function initialize(address starterOwner)
    public virtual
    {
        require(!initialized, "Contract is already initialized");
        controller = starterOwner;
        // Generate the private / public keypair
        bytes memory pubKey;
        bytes memory privKey;
        (pubKey, privKey) = Sapphire.generateSigningKeyPair(Sapphire.SigningAlg.Secp256k1PrehashedKeccak256, Sapphire.randomBytes(32, ""));
        publicKey = EthereumUtils.k256PubkeyToEthereumAddress(pubKey);
        privateKey = bytes32(privKey);
        initialized = true;
    }

    modifier validateController {
        require(msg.sender == controller, "Only the controller may access this function");
        _;
    }

    // Update the controller of this account. Useful when a different
    // type of credential is to be used and a validator contract is needed.
    function updateController(address _controller) external override validateController {
        // I'm not sure if this is the correct way to do access control
        controller = _controller;
    }

    // Functions to check and update permissions.
    function hasPermission(address grantee) public view override
        returns (bool) {
        // Check that there's an entry for the grantee and that the expiration is greater than the current timestamp
        return (grantee == controller || (permission[grantee] != 0 && permission[grantee] >= block.timestamp));
    }

    modifier authorized {
        require(hasPermission(msg.sender) || msg.sender == address(this),
            "Message sender doesn't have permission to access this account");
        _;
    }

    function grantPermission(address grantee, uint256 expiry) public virtual override validateController {
        permission[grantee] = expiry;
    }

    function revokePermission(address grantee) public virtual override validateController {
        permission[grantee] = 0;
    }

    function signEIP155(EIP155Signer.EthTx calldata txToSign)
        public view override authorized
        returns (bytes memory) {
        return EIP155Signer.sign(publicKey, privateKey, txToSign);
    }

    function sign(bytes32 digest)
        public view override authorized
        returns (SignatureRSV memory) {
        return EthereumUtils.sign(publicKey, privateKey, digest);
    }

    /// @notice Create a proxy transaction that the `proxy` function will then execute
    /// This is helpful for using this account as a Gasless Relayer and code is taken from
    /// https://github.com/oasisprotocol/sapphire-paratime/blob/main/examples/onchain-signer/contracts/Gasless.sol#L23
    /// @param in_contract Address of contract to call
    /// @param in_data Data to pass to the contract
    /// @param nonce Nonce for the transaction
    /// @returns Transaction encoded in EIP-155 format with signature
    function makeProxyTx(
        address in_contract,
        bytes memory in_data,
        uint64 nonce
    ) external view authorized
    returns (bytes memory output) {
        bytes memory data = abi.encode(in_contract, in_data);

        return
        EIP155Signer.sign(
            publicKey,
            privateKey,
            EIP155Signer.EthTx({
                nonce: nonce,
                gasPrice: 100_000_000_000,
                gasLimit: 250000,
                to: address(this),
                value: 0,
                data: abi.encodeCall(this.proxy, data),
                chainId: block.chainid
            })
        );
    }


    /// @notice Function that is called by the makeProxyTx function once the signed transaction
    /// is submitted
    /// @param data Data passed in by makeProxyTx that is unpacked into (address, bytes)
    function proxy(bytes memory data) external authorized payable {
        (address addr, bytes memory subcallData) = abi.decode(
            data,
            (address, bytes)
        );
        (bool success, bytes memory outData) = addr.call{value: msg.value}(
            subcallData
        );
        if (!success) {
            // Add inner-transaction meaningful data in case of error.
            assembly {
                revert(add(outData, 32), mload(outData))
            }
        }

        nonce += 1;
    }


    /// @notice Call another contract. Useful if other contracts depend on authorization from this one
    /// This function is potentially state-changing and is payable as well
    /// @param in_contract contract to call
    /// @param in_data Data to pass in for contract
    function call(address in_contract, bytes memory in_data)
        public payable override authorized
        returns (bool success, bytes memory out_data) {

        (success, out_data) = in_contract.call{value: msg.value, gas: gasleft()}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }

    /// @notice Staticcall another contract. Useful if other contracts depend on authorization from this one
    /// Since this function uses staticcall it should only be used to call view/pure functions
    /// @param in_contract contract to call
    /// @param in_data Data to pass in for contract
    function staticcall(address in_contract, bytes memory in_data)
        public override view authorized
        returns (bool success, bytes memory out_data) {

        (success, out_data) = in_contract.staticcall{gas: gasleft()}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }
}