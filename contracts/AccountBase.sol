// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {SignatureRSV, EthereumUtils} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {EIP155Signer} from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";

// A contract to create per-identity account.
abstract contract AccountFactoryBase {
    function clone (address starterOwner)
    public virtual
    returns (AccountBase acct);
}

// A base class for a per-identity account.
// It can be extended to include additional data, for example a symmetric
// key for encrypting and decryption off-chain data.
abstract contract AccountBase {
    // Address of the controller of this account. It can either be
    // an EOA (externally owned account), or a validator contract
    // (defined below).
//    address private controller;

    // Update the controller of this account. Useful when a different
    // type of credential is to be used and a validator contract is needed.
    function updateController(address _controller) external virtual authorized;

    // A key pair for the account.
    address public publicKey;
//    bytes32 private privateKey;

    // Grant permission for another address to act as owner for this account
    // until expiry.
    mapping (address => uint256) permission;

    // Functions to check and update permissions.
    function hasPermission(address grantee) public virtual view
    returns (bool);

    modifier authorized {
        require(hasPermission(msg.sender), "Message sender doesn't have permission to access this account");
        _;
    }

    function grantPermission(address grantee, uint256 expiry)
    public virtual authorized;
    function revokePermission(address grantee) public virtual authorized;

    // The remaining functions use the key pair for normal contract operations.

    // Sign a transaction.
    function signEIP155(EIP155Signer.EthTx calldata txToSign)
    public virtual view authorized
    returns (bytes memory);

    // Sign a digest.
    function sign(bytes32 digest)
    public virtual view authorized
    returns (SignatureRSV memory);

    // Call another contract.
    function call(address in_contract, bytes memory in_data)
    public payable virtual authorized
    returns (bool success, bytes memory out_data);

    // Call another contract.
    function staticcall(address in_contract, bytes memory in_data)
    public virtual view authorized
    returns (bool success, bytes memory out_data);
}
