// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Account.sol";
import { EIP155Signer } from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";

/// @title Account implementation with permissioned signing capabilities
/// @notice Extends base Account with the ability to restrict signing to specific contracts
contract AccountWithPermKey is Account {
    /// @notice Mapping of whitelisted contracts for permissioned signers
    /// @dev grantee => contract address => is whitelisted
    mapping(address => mapping(address => bool)) private _permissionedContracts;

    /// @notice Emitted when a contract is whitelisted for a grantee
    event ContractWhitelisted(address indexed grantee, address indexed contractAddress);

    /// @notice Emitted when a contract is removed from whitelist for a grantee
    event ContractRemoved(address indexed grantee, address indexed contractAddress);

    constructor(address owner_) Account(owner_) {}

    /// @notice Adds multiple contracts to the whitelist for a specific grantee
    /// @param grantee The address that will have permission to sign for these contracts
    /// @param contractAddresses Array of contract addresses to whitelist
    function addWhitelistedContracts(address grantee, address[] calldata contractAddresses) external onlyOwner {
        if (grantee == address(0)) revert ZeroAddress();

        for (uint256 i = 0; i < contractAddresses.length; i++) {
            address contractAddress = contractAddresses[i];
            if (contractAddress == address(0)) revert ZeroAddress();

            _permissionedContracts[grantee][contractAddress] = true;
            emit ContractWhitelisted(grantee, contractAddress);
        }
    }

    /// @notice Removes multiple contracts from the whitelist for a specific grantee
    /// @param grantee The address to remove the contract permissions from
    /// @param contractAddresses Array of contract addresses to remove
    function removeWhitelistedContracts(address grantee, address[] calldata contractAddresses) external onlyOwner {
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            address contractAddress = contractAddresses[i];
            _permissionedContracts[grantee][contractAddress] = false;
            emit ContractRemoved(grantee, contractAddress);
        }
    }

    /// @notice Checks if a grantee has permission to sign for a specific contract
    /// @param grantee The address to check permissions for
    /// @param contractAddress The contract address to check
    /// @return bool True if the grantee has permission for the contract
    function isContractWhitelisted(address grantee, address contractAddress) public view returns (bool) {
        return _permissionedContracts[grantee][contractAddress];
    }

    /// @inheritdoc Account
    function signEIP155(EIP155Signer.EthTx calldata txToSign) public view override returns (bytes memory) {
        /// @dev If caller is owner, allow signing for any contract
        if (msg.sender == owner()) {
            return super.signEIP155(txToSign);
        }

        /// @dev Check if caller has basic permission
        if (!hasPermission(msg.sender)) {
            revert Unauthorized();
        }

        /// @dev For permissioned users, check if the target contract is whitelisted
        if (!isContractWhitelisted(msg.sender, txToSign.to)) {
            revert Unauthorized();
        }

        return super.signEIP155(txToSign);
    }

    /// @notice Override grantPermission to prevent permissioned users from signing for whitelisted contracts
    function grantPermission(address grantee, uint256 expiry) public override onlyOwner {
        super.grantPermission(grantee, expiry);
    }
}
