// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SignatureRSV } from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import { EIP155Signer } from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";

/// @title Base interface for identity accounts
/// @notice Defines core functionality for account management and permissions
interface IAccountBase {
    /// @notice Checks if an address has valid permissions
    /// @param grantee Address to check permissions for
    /// @return True if address has valid permissions
    function hasPermission(address grantee) external view returns (bool);

    /// @notice Grants temporary permission to an address
    /// @param grantee Address to grant permission to
    /// @param expiry Timestamp when permission expires
    function grantPermission(address grantee, uint256 expiry) external;

    /// @notice Revokes permission from an address
    /// @param grantee Address to revoke permission from
    function revokePermission(address grantee) external;

    /// @notice Signs a transaction using EIP-155 encoding
    /// @param txToSign Transaction data to sign
    /// @return Signed transaction bytes
    function signEIP155(EIP155Signer.EthTx calldata txToSign) external view returns (bytes memory);

    /// @notice Signs an arbitrary message digest
    /// @param digest Message digest to sign
    /// @return Signature components in RSV format
    function sign(bytes32 digest) external view returns (SignatureRSV memory);

    /// @notice Executes a call to another contract
    /// @param target Address of contract to call
    /// @param data Call data to send
    /// @return success Whether the call was successful
    /// @return result Data returned from the call
    function call(
        address target,
        bytes memory data
    ) external payable returns (bool success, bytes memory result);

    /// @notice Executes a static call to another contract
    /// @param target Address of contract to call
    /// @param data Call data to send
    /// @return success Whether the call was successful
    /// @return result Data returned from the call
    function staticcall(
        address target,
        bytes memory data
    ) external view returns (bool success, bytes memory result);
} 