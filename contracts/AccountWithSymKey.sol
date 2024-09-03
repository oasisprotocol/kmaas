// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Account.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

contract AccountWithSymKey is Account {
    type Key is bytes32;

    constructor(address starterOwner) Account(starterOwner) {}

    // Named symmetric keys. name -> key
    mapping (string => Key) keys;

    // Generate a named symmetric key.
    function generateSymKey(string calldata name, bool overwrite)
    public virtual authorized {
//        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        require(overwrite || Key.unwrap(keys[name]) == bytes32(0));
        // If the same name is given I think this will always generate the same key - not sure if that's
        // desired behavior or not
        bytes memory domainSep = bytes(name);
        // TODO define this as bytes32?
//        (bytes32 pubKey, bytes32 privKey) = Sapphire.generateCurve25519KeyPair(domainSep);
        (Sapphire.Curve25519PublicKey pubKey, Sapphire.Curve25519SecretKey privKey) = Sapphire.generateCurve25519KeyPair(domainSep);
        Key symKey = Key.wrap(Sapphire.deriveSymmetricKey(pubKey, privKey));
        keys[name] = symKey;
    }

    // Retrieve a named symmetric key.
    function getSymKey(string calldata name)
    public virtual view authorized
    returns (Key key) {
//        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        key = keys[name];
    }

    // Delete a named symmetric key.
    function deleteSymKey(string calldata name)
    external virtual {
//        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        keys[name] = Key.wrap(bytes32(0));
    }

    // Encrypt in_data with the named symmetric key.
    function encryptSymKey(string calldata name, bytes memory in_data, bytes memory authTag)
    public virtual authorized
    returns (bytes memory out_data) {
//        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        require(Key.unwrap(keys[name]) != bytes32(0), "Requested key doesn't exist");
        // v1
        bytes32 nonce = bytes32(0);
        out_data = Sapphire.encrypt(Key.unwrap(keys[name]), nonce, in_data, authTag);


        // v2
//        bytes32 nonce = bytes32(Sapphire.randomBytes(15, ""));
//        bytes memory cipherText = Sapphire.encrypt(keys[name], nonce, in_data, authTag);
//        out_data = new bytes(32 + cipherText.length);
//        assembly {
//            let dataElementLocation := add(out_data, 0x20)
//            mcopy(dataElementLocation, nonce, 0x20)
//            dataElementLocation := add(dataElementLocation, 0x20)
//            mcopy(dataElementLocation, out_data, out_data.length)
//        }
    }

    function decryptSymKey(string calldata name, bytes memory in_data, bytes memory authTag)
    public virtual authorized
    returns (bytes memory out_data) {
//        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        require(Key.unwrap(keys[name]) != bytes32(0), "Requested key doesn't exist");

        // v1
        bytes32 nonce = bytes32(0);
        out_data = Sapphire.decrypt(Key.unwrap(keys[name]), nonce, in_data, authTag);


        // v2
//        bytes32 nonce;
//        bytes memory cipherText = new bytes(in_data.length - 32);
//        assembly {
//            // First 32 bytes is the array length
//            let dataElementLocation := add(in_data, 0x20)
//            // Copy 32 byte nonce
//            mcopy(nonce, dataElementLocation, 0x20)
//            dataElementLocation := add(dataElementLocation, 0x20)
//            // First 32 bytes of cipherText array store the length
//            mcopy(add(cipherText, 0x20), dataElementLocation, cipherText.length)
//        }
//
//        out_data = Sapphire.decrypt(keys[name], nonce, in_data, authTag);

    }

    // Some key rotation stuff here?
}
