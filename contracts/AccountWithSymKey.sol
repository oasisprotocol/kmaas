// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Account.sol";
import { Sapphire } from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

/// @title Account implementation with symmetric key encryption capabilities
/// @notice Extends base Account with symmetric key management for on-chain/off-chain encryption
contract AccountWithSymKey is Account {
    /// @notice Custom type for symmetric keys
    type Key is bytes32;

    /// @notice Mapping of named symmetric keys
    /// @dev name => key
    mapping(string => Key) private _keys;

    constructor(address owner_) Account(owner_) {}

    /// @notice Generates a new symmetric key with specified name
    /// @param name_ Name to associate with the key
    /// @param overwrite_ Whether to overwrite if key already exists
    function generateSymKey(string calldata name_, bool overwrite_) public onlyAuthorized {
        require(overwrite_ || Key.unwrap(_keys[name_]) == bytes32(0), "Key already exists and overwrite is false");
        _keys[name_] = Key.wrap(bytes32(Sapphire.randomBytes(32, bytes(name_))));
    }

    /// @notice Retrieves a symmetric key by name
    /// @param name_ Name of the key to retrieve
    /// @return key The symmetric key
    function getSymKey(string calldata name_) public view onlyAuthorized returns (Key key) {
        key = _keys[name_];
    }

    /// @notice Deletes a symmetric key
    /// @param name_ Name of the key to delete
    function deleteSymKey(string calldata name_) external virtual onlyAuthorized {
        _keys[name_] = Key.wrap(bytes32(0));
    }

    /// @notice Encrypts data using a named symmetric key
    /// @param name_ Name of the key to use for encryption
    /// @param data_ Data to encrypt
    /// @return encryptedData Encoded bytes containing nonce and encrypted data
    function encryptSymKey(
        string calldata name_,
        bytes memory data_
    ) public view virtual onlyAuthorized returns (bytes memory encryptedData) {
        require(Key.unwrap(_keys[name_]) != bytes32(0), "Requested key doesn't exist");
        bytes32 nonce = bytes32(Sapphire.randomBytes(32, ""));
        bytes memory ciphertext = Sapphire.encrypt(Key.unwrap(_keys[name_]), nonce, data_, "");
        encryptedData = abi.encode(nonce, ciphertext);
    }

    /// @notice Decrypts data using a named symmetric key
    /// @param name_ Name of the key to use for decryption
    /// @param data_ Encrypted data to decrypt
    /// @return decryptedData Plaintext bytes
    function decryptSymKey(
        string calldata name_,
        bytes memory data_
    ) public view onlyAuthorized returns (bytes memory decryptedData) {
        (bytes32 nonce, bytes memory ciphertext) = abi.decode(data_, (bytes32, bytes));
        decryptedData = Sapphire.decrypt(Key.unwrap(_keys[name_]), nonce, ciphertext, "");
    }
}
