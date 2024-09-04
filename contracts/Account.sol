// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {SignatureRSV, EthereumUtils} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import {EIP155Signer} from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";
import {AccountBase, AccountFactoryBase} from "./AccountBase.sol";


// A contract to create per-identity account.
contract AccountFactory is AccountFactoryBase {
    event AccountCreated(address contractAddress);

    function clone (address starterOwner)
        // I guess there should be some specification of the type of account this should create
        public virtual override
        returns (AccountBase acct) {
        AccountBase acc = new Account(starterOwner);
        emit AccountCreated(address(acc));
        return acc;
    }
}

// A base class for a per-identity account.
// It can be extended to include additional data, for example a symmetric
// key for encrypting and decryption off-chain data.
contract Account is AccountBase {
    address private controller;
    bytes32 private privateKey;
    uint64 nonce;

    constructor(address starterOwner) {
        controller = starterOwner;
        // Generate the private / public keypair
        bytes memory pubKey;
        bytes memory privKey;
        (pubKey, privKey) = Sapphire.generateSigningKeyPair(Sapphire.SigningAlg.Secp256k1PrehashedKeccak256, Sapphire.randomBytes(32, ""));
        publicKey = EthereumUtils.k256PubkeyToEthereumAddress(pubKey);
        privateKey = bytes32(privKey);
        nonce = 0;
    }

    // Update the controller of this account. Useful when a different
    // type of credential is to be used and a validator contract is needed.
    function updateController(address _controller) external override authorized {
        // I'm not sure if this is the correct way to do access control
        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        controller = _controller;
    }

    // Functions to check and update permissions.
    function hasPermission(address grantee) public view override
        returns (bool) {
        // Check that there's an entry for the grantee and that the expiration is greater than the current timestamp
        return (grantee == controller || (permission[grantee] != 0 && permission[grantee] >= block.timestamp));
    }

    modifier authorized {
        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        _;
    }

    function grantPermission(address grantee, uint256 expiry) public virtual override authorized {
        // require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        permission[grantee] = expiry;
    }

    function revokePermission(address grantee) public virtual override authorized {
        // Should this only be available to the controller or to anybody that has permission?
        // require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        permission[grantee] = 0;
    }

    // The remaining functions use the key pair for normal contract operations.

    // Sign a transaction.
    function signEIP155(EIP155Signer.EthTx calldata txToSign, SignatureRSV calldata signature)
        public view override
        returns (bytes memory) {
//        require(hasPermission(ecrecover(keccak256(abi.encode(txToSign)), uint8(signature.v), signature.r, signature.s)), "Message sender does not have permission to access this function");
        // verify that the signer is authorized
        return EIP155Signer.sign(publicKey, privateKey, txToSign);
    }

    // Sign a digest.
    function sign(bytes32 digest, SignatureRSV calldata signature)
        public view override 
        returns (SignatureRSV memory) {
        // TODO Once confirming that this works, turn this into a function modifier
        require(hasPermission(ecrecover(digest, uint8(signature.v), signature.r, signature.s)), "Message sender does not have permission to access this function");
        return EthereumUtils.sign(publicKey, privateKey, digest);
    }

    function makeProxyTx(
        address in_contract,
        bytes memory in_data
    ) external view returns (bytes memory output) {
        bytes memory data = abi.encode(in_contract, in_data);

        // Call will invoke proxy().
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

    function proxy(bytes memory data) external payable {
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


    // Call another contract.
    // Primarily for use as a gas relayer
    function call(address in_contract, bytes memory in_data)
        public payable override authorized
        returns (bool success, bytes memory out_data) {

//        bytes memory signed_in_data = EIP155Signer.sign(publicKey, privateKey, EIP155Signer.EthTx({
//            nonce: nonce,
//            gasPrice: tx.gasprice,
//            gasLimit: uint64(gasleft()),
//            to: in_contract,
//            value: msg.value,
//            data: in_data,
//            chainId: block.chainid
//        }));
        // Ok so this doesn't work because call just expects the function data
        // Not sure if the way that I'm imagining this is even possible

        (success, out_data) = in_contract.call{value: msg.value, gas: gasleft()}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
        nonce++;
    }

    // Call another contract.
    function staticcall(address in_contract, bytes memory in_data)
        public override view authorized
        returns (bool success, bytes memory out_data) {

//        bytes memory signed_in_data = EIP155Signer.sign(publicKey, privateKey, EIP155Signer.EthTx({
//            nonce: 0,
//            gasPrice: tx.gasprice,
//            gasLimit: uint64(gasleft()),
//            to: in_contract,
//            value: 0,
//            data: in_data,
//            chainId: block.chainid
//        }));
        (success, out_data) = in_contract.staticcall{gas: gasleft()}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }
}