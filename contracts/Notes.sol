// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {AccountWithSymKey} from "./AccountWithSymKey.sol";
import "./Validator.sol";
contract Notes {
    event UserCreated(address kmaasAddress, address publicKey);
    
    /// @notice This function creates a KMaaS account and generates the keys required for the
    /// notes application
    /// @param validatorAddress address of Validator to add KMaaS account to
    /// @param cred Credentials for account`
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