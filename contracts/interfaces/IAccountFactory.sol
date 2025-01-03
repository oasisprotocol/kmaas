// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Interface for account factory
interface IAccountFactory {
    /// @notice Account type enumeration
    enum AccountType {
        Basic,
        SymKey,
        PermKey
    }

    /// @notice Event emitted when a new account is created
    /// @param contractAddress The address of the created account
    /// @param accountType The type of account that was created (0=Basic, 1=SymKey, 2=PermKey)
    event AccountCreated(address contractAddress, uint8 accountType);

    /// @notice Creates a new account instance with specified type
    /// @param owner The owner of the new Account
    /// @param accountType The type of account to deploy
    /// @return The address of the newly created Account
    function deployAccountWithType(address owner, AccountType accountType) external returns (address);
}
