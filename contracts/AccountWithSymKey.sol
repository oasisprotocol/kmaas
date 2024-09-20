// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Account.sol";
import "./AccountBase.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

// A contract to create per-identity account.
contract AccountWithSymKeyFactory is AccountFactory {
    function clone (address target)
    public override {
        bytes20 targetBytes = bytes20(target);
        address contractAddr;
        assembly {
            let contractClone := mload(0x40)
            mstore(contractClone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(contractClone, 0x14), targetBytes)
            mstore(add(contractClone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            contractAddr := create(0, contractClone, 0x37)
        }
        emit AccountCreated(contractAddr);
    }
}

contract AccountWithSymKey is Account {
    type Key is bytes32;

    function initialize(address starterOwner)
    public override {
        Account.initialize(starterOwner);
    }

    // Named symmetric keys. name -> key
    mapping (string => Key) keys;

    // Generate a named symmetric key.
    function generateSymKey(string calldata name, bool overwrite)
    public authorized {
        require(overwrite || Key.unwrap(keys[name]) == bytes32(0), "Key already exists and overwrite is false");

        keys[name] = Key.wrap(bytes32(Sapphire.randomBytes(32, bytes(name))));
    }

    // Retrieve a named symmetric key.
    function getSymKey(string calldata name)
    public view authorized
    returns (Key key) {
        key = keys[name];
    }

    // Delete a named symmetric key.
    function deleteSymKey(string calldata name)
    external virtual authorized {
        keys[name] = Key.wrap(bytes32(0));
    }

    // Encrypt in_data with the named symmetric key.
    function encryptSymKey(string calldata name, bytes memory in_data)
    public virtual view authorized
    returns (bytes memory out_data) {
        require(Key.unwrap(keys[name]) != bytes32(0), "Requested key doesn't exist");
        bytes32 nonce = bytes32(Sapphire.randomBytes(32, ""));
        bytes memory ciphertext = Sapphire.encrypt(Key.unwrap(keys[name]), nonce, in_data, "");
        out_data = abi.encode(nonce, ciphertext);
    }

    function decryptSymKey(string calldata name, bytes memory in_data)
    public view authorized
    returns (bytes memory out_data) {
        (bytes32 nonce, bytes memory ciphertext) = abi.decode(in_data, (bytes32, bytes));
        out_data = Sapphire.decrypt(Key.unwrap(keys[name]), nonce, ciphertext, "");
    }

}
