// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IAccountFactory } from "./interfaces/IAccountFactory.sol";
import { IErrors } from "./interfaces/IErrors.sol";
import { Account } from "./Account.sol";

/// @title Factory contract for Account creation
/// @notice Handles deployment of new Account instances
contract AccountFactory is IAccountFactory, IErrors {
    /// @inheritdoc IAccountFactory
    function deployAccount(address owner) external override returns (address accountAddress) {
        if (owner == address(0)) revert ZeroAddress();

        Account account = new Account(owner);
        accountAddress = address(account);
        emit AccountCreated(accountAddress);
    }
}
