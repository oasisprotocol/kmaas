// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {SignatureRSV, EthereumUtils} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {EIP155Signer} from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";

// A contract to create per-identity account.
abstract contract AccountFactoryBase {
    function clone (address starterOwner)
    public virtual;
}

/// @title A base class for a per-identity account.
/// It can be extended to include additional data, for example a symmetric
/// key for encrypting and decryption off-chain data.
abstract contract AccountBase {
    /// Address of the controller - It can either be an EOA or a validator contract
    address internal controller;

    /// @param _controller Address to update the controller to
    /// This can be useful when a different type of credential is to be used
    /// and a validator contract is needed.
    function updateController(address _controller) external virtual;

    /// A key pair for the account.
    address public publicKey;
    bytes32 internal privateKey;

    /// Grant permission for another address to act as owner for this account
    /// until expiry.
    mapping (address => uint256) permission;

    /// @notice Function to check permissions
    /// @param Address to check
    function hasPermission(address grantee) public virtual view
    returns (bool);

    function grantPermission(address grantee, uint256 expiry)
    public virtual;
    function revokePermission(address grantee) public virtual;

    // The remaining functions use the key pair for normal contract operations.

    /// @notice Signs a transaction and returns it in EIP-155 encoded form
    /// @param txToSign The transaction to sign with the private key
    function signEIP155(EIP155Signer.EthTx calldata txToSign)
    public view virtual
    returns (bytes memory);

    /// @notice Sign a digest
    /// @param digest The digest to sign
    function sign(bytes32 digest)
    public virtual view
    returns (SignatureRSV memory);

    /// @notice Call another contract. This can be useful if other contracts depend upon
    /// msg.sender being this contract for authorization. This makes a staticcall so it can only be used
    /// to call pure and view functions
    /// @param in_contract contract address to call
    /// @param in_data encoded function data to pass to the contract
    function call(address in_contract, bytes memory in_data)
    public payable virtual
    returns (bool success, bytes memory out_data);

    /// @notice Call another contract. This can be useful if other contracts depend upon
    /// msg.sender being this contract for authorization. This makes a call so it can be used
    /// to call state-changing and payable functions
    /// @param in_contract contract address to call
    /// @param in_data encoded function data to pass to the contract
    function staticcall(address in_contract, bytes memory in_data)
    public virtual view
    returns (bool success, bytes memory out_data);
}
