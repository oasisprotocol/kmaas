// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {AccountWithSymKey} from "./AccountWithSymKey.sol";
import "./Validator.sol";

/// @notice This contract creates user KMaaS accounts as well as forwards logging transactions on behalf of the user so that
/// they don't have to pay gas. It serves as the trusted forwarder contract as per ERC-2771
contract Notes {
    event UserCreated(address kmaasAddress, address publicKey);

    /// @notice This function forwards the function call it is passed on behalf of the original sender
    /// Along with the function data it appends the original message sender to the end of the calldata such that if the address
    /// of this contract is passed into the constructor of the Logging contract, the ERC2771Context parent of the Logging contract
    /// will be able to retrieve the original sender of the message
    /// @param data Encoded bytes that contain (address, bytes) for the address of the contract to call and the function data to pass
    function proxy(bytes memory data) external payable {
        (address addr, bytes memory subcallData) = abi.decode(
            data,
            (address, bytes)
        );
        (bool success, bytes memory outData) = addr.call{value: msg.value}(
            // This appends the original sender to the calldata to allow a recipient contract that implements ERC-2771 to retrieve it
            abi.encodePacked(subcallData, msg.sender)
        );
        if (!success) {
            // Add inner-transaction meaningful data in case of error.
            assembly {
                revert(add(outData, 32), mload(outData))
            }
        }
    }
    
    function createUser(address validatorAddress,
                        Credential memory cred)
        public
        returns (address kmaasAddress) {
        AccountWithSymKey kmaas = new AccountWithSymKey();
        // Initialize account and generate keys
        kmaas.initialize(address(this));
        kmaas.generateSymKey("notes", false);
        kmaas.generateSymKey("tokenSigner", false);
        // Update controller to validator
        kmaas.updateController(validatorAddress);
        // Add the KMaaS account to the validator
        Validator validator = Validator(validatorAddress);
        kmaasAddress = address(kmaas);
        address publicKey = kmaas.publicKey();
        validator.addAccount(kmaasAddress, cred);
        emit UserCreated(kmaasAddress, publicKey);
        return kmaasAddress;
    }
}