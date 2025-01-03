// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Custom errors for Account system
interface IErrors {
    /// @notice Thrown when an unauthorized address attempts to access protected functions
    error Unauthorized();

    /// @notice Thrown when a call to external contract fails
    error ExternalCallFailed();

    /// @notice Thrown when operation is attempted with zero address
    error ZeroAddress();

    /// @notice Thrown when an invalid account type is provided
    error InvalidAccountType();
}
