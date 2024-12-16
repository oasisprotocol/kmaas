// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Interface for account factory
interface IAccountFactory {
    /// @notice Event emitted when a new account is created
    event AccountCreated(address contractAddress);

    /// @notice Creates a new account instance
    /// @param _owner The owner of the new Account
    /// @return The address of the newly created Account
    function deployAccount(address _owner) external returns (address);
}
