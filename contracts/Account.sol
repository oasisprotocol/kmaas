// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { SignatureRSV, EthereumUtils } from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import { Sapphire } from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import { EIP155Signer } from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";

import { IAccountBase } from "./interfaces/IAccountBase.sol";
import { IErrors } from "./interfaces/IErrors.sol";

/// @title Account implementation for identity management
/// @notice Manages permissions and signing capabilities for a single identity
contract Account is IAccountBase, Ownable, IErrors {
    /// @notice Emitted when permission is granted to an address
    event PermissionGranted(address indexed grantee, uint256 expiry);

    /// @notice Emitted when permission is revoked from an address
    event PermissionRevoked(address indexed grantee);

    /// @notice Public key associated with this account
    address public publicKey;

    /// @notice Private key for signing operations
    bytes32 private _privateKey;

    /// @notice Mapping of address permissions with their expiry timestamps
    /// @dev grantee => expiry timestamp
    mapping(address => uint256) private _permissions;

    constructor(address owner_) Ownable(owner_) {
        if (owner_ == address(0)) revert ZeroAddress();

        // Generate the private / public keypair
        bytes memory pubKey;
        bytes memory privKey;
        (pubKey, privKey) = Sapphire.generateSigningKeyPair(
            Sapphire.SigningAlg.Secp256k1PrehashedKeccak256,
            Sapphire.randomBytes(32, "")
        );
        publicKey = EthereumUtils.k256PubkeyToEthereumAddress(pubKey);
        _privateKey = bytes32(privKey);
    }

    /// @inheritdoc IAccountBase
    function hasPermission(address grantee) public view override returns (bool) {
        return grantee == owner() || (_permissions[grantee] != 0 && _permissions[grantee] >= block.timestamp);
    }

    /// @notice Ensures caller has permission to execute function
    modifier onlyAuthorized() {
        if (!hasPermission(msg.sender) && msg.sender != address(this)) {
            revert Unauthorized();
        }
        _;
    }

    /// @inheritdoc IAccountBase
    function grantPermission(address grantee, uint256 expiry) public virtual override onlyOwner {
        if (grantee == address(0)) revert ZeroAddress();
        _permissions[grantee] = expiry;
        emit PermissionGranted(grantee, expiry);
    }

    /// @inheritdoc IAccountBase
    function revokePermission(address grantee) public virtual override onlyOwner {
        _permissions[grantee] = 0;
        emit PermissionRevoked(grantee);
    }

    /// @inheritdoc IAccountBase
    function signEIP155(
        EIP155Signer.EthTx calldata txToSign
    ) public view virtual override onlyAuthorized returns (bytes memory) {
        return EIP155Signer.sign(publicKey, _privateKey, txToSign);
    }

    /// @inheritdoc IAccountBase
    function sign(bytes32 digest) public view override onlyAuthorized returns (SignatureRSV memory) {
        return EthereumUtils.sign(publicKey, _privateKey, digest);
    }

    /// @inheritdoc IAccountBase
    function call(
        address target,
        bytes memory data
    ) public payable override onlyAuthorized returns (bool success, bytes memory result) {
        if (target == address(0)) revert ZeroAddress();

        (success, result) = target.call{ value: msg.value, gas: gasleft() }(data);
        if (!success) revert ExternalCallFailed();
    }

    /// @inheritdoc IAccountBase
    function staticcall(
        address target,
        bytes memory data
    ) public view override onlyAuthorized returns (bool success, bytes memory result) {
        if (target == address(0)) revert ZeroAddress();

        (success, result) = target.staticcall{ gas: gasleft() }(data);
        if (!success) revert ExternalCallFailed();
    }
}
