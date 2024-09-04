// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Account.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

// A contract to create per-identity account.
contract AccountWithSymKeyFactory is AccountFactory {
    function clone (address starterOwner)
        // I guess there should be some specification of the type of account this should create
    public override
    returns (AccountBase acct) {
        AccountBase acc = new AccountWithSymKey(starterOwner);
        emit AccountCreated(address(acc));
        return acc;
    }
}

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
    public virtual view
    returns (Key key) {
        // TODO Some authentication here
        key = keys[name];
    }

    // Delete a named symmetric key.
    function deleteSymKey(string calldata name)
    external virtual {
        keys[name] = Key.wrap(bytes32(0));
    }

    // Encrypt in_data with the named symmetric key.
    function encryptSymKey(string calldata name, bytes memory in_data, bytes memory authTag)
    public virtual view
    returns (bytes memory out_data) {
        // TODO Some authentication here
        require(Key.unwrap(keys[name]) != bytes32(0), "Requested key doesn't exist");
        bytes32 nonce = bytes32(Sapphire.randomBytes(32, ""));
        bytes memory ciphertext = Sapphire.encrypt(Key.unwrap(keys[name]), nonce, in_data, authTag);
        out_data = abi.encodePacked(nonce, ciphertext);
    }

    function decryptSymKey(string calldata name, bytes memory in_data, bytes memory authTag)
    public virtual view
    returns (bytes memory out_data) {
        // TODO Some authentication here
        require(Key.unwrap(keys[name]) != bytes32(0), "Requested key doesn't exist");
        (bytes32 nonce, bytes memory ciphertext) = abi.decode(in_data, (bytes32, bytes));
        out_data = Sapphire.decrypt(Key.unwrap(keys[name]), nonce, ciphertext, authTag);
    }

    // Some key rotation stuff here?
}
