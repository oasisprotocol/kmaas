// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {SignatureRSV, EthereumUtils} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import {EIP155Signer} from "@oasisprotocol/sapphire-contracts/contracts/EIP155Signer.sol";
import {AccountBase, AccountFactoryBase} from "./AccountBase.sol";


/// @title A contract to create per-identity account.
contract AccountFactory is AccountFactoryBase {
    /// Logs the address of the created account on-chain
    event AccountCreated(address contractAddress);

    /// @notice This function creates a proxy of the target contract as per ERC-1167.
    /// @param address of target master contract to clone
    function createProxy(address target)
        public virtual override {
        // Note that this function creates a proxy contract to make contract deployment much cheaper. However, subsequent calls
        // to the proxy contract are forwarded to the original contract instance making subsequent invocations slightly more expensive.
        // As a result, consider the number of calls your application will make to the KMaaS account to determine whether creating
        // a proxy contract or deploying the Account contract itself is gas-optimal.
        bytes20 targetBytes = bytes20(target);
        address contractAddr;
        assembly {
            let contractClone := mload(0x40)
            // This contains 1. the init code to deploy the contract 2. bytes to copy calldata into memory and push the address
            // of the target contract
            mstore(contractClone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            // Store the address of the target contract
            mstore(add(contractClone, 0x14), targetBytes)
            // This contains the code to execute delegatecall to the target address, as well as return/revert based on function execution
            mstore(add(contractClone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            contractAddr := create(0, contractClone, 0x37)
        }
        require(contractAddr != address(0), "Create failed");
        emit AccountCreated(contractAddr);
    }
}

/// @title A base class for a per-identity account.
/// It can be extended to include additional data, for example a symmetric
/// key for encrypting and decryption off-chain data.
contract Account is AccountBase {
    bool initialized;

    function initialize(address starterOwner)
    public virtual
    {
        require(!initialized, "Contract is already initialized");
        controller = starterOwner;
        // Generate the private / public keypair
        bytes memory pubKey;
        bytes memory privKey;
        (pubKey, privKey) = Sapphire.generateSigningKeyPair(Sapphire.SigningAlg.Secp256k1PrehashedKeccak256, Sapphire.randomBytes(32, ""));
        publicKey = EthereumUtils.k256PubkeyToEthereumAddress(pubKey);
        privateKey = bytes32(privKey);
        initialized = true;
    }

    modifier validateController {
        require(msg.sender == controller, "Only the controller may access this function");
        _;
    }

    // Update the controller of this account. Useful when a different
    // type of credential is to be used and a validator contract is needed.
    function updateController(address _controller) external override validateController {
        // I'm not sure if this is the correct way to do access control
        controller = _controller;
    }

    // Functions to check and update permissions.
    function hasPermission(address grantee) public view override
        returns (bool) {
        // Check that there's an entry for the grantee and that the expiration is greater than the current timestamp
        return (grantee == controller || (permission[grantee] != 0 && permission[grantee] >= block.timestamp));
    }

    modifier authorized {
        require(hasPermission(msg.sender) || msg.sender == address(this),
            "Message sender doesn't have permission to access this account");
        _;
    }

    function grantPermission(address grantee, uint256 expiry) public virtual override validateController {
        permission[grantee] = expiry;
    }

    function revokePermission(address grantee) public virtual override validateController {
        permission[grantee] = 0;
    }

    function signEIP155(EIP155Signer.EthTx calldata txToSign)
        public view override authorized
        returns (bytes memory) {
        return EIP155Signer.sign(publicKey, privateKey, txToSign);
    }

    function sign(bytes32 digest)
        public view override authorized
        returns (SignatureRSV memory) {
        return EthereumUtils.sign(publicKey, privateKey, digest);
    }


    /// @notice Call another contract. Useful if other contracts depend on authorization from this one
    /// This function is potentially state-changing and is payable as well
    /// @param in_contract contract to call
    /// @param in_data Data to pass in for contract
    function call(address in_contract, bytes memory in_data)
        public payable override authorized
        returns (bool success, bytes memory out_data) {

        (success, out_data) = in_contract.call{value: msg.value, gas: gasleft()}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }

    /// @notice Staticcall another contract. Useful if other contracts depend on authorization from this one
    /// Since this function uses staticcall it should only be used to call view/pure functions
    /// @param in_contract contract to call
    /// @param in_data Data to pass in for contract
    function staticcall(address in_contract, bytes memory in_data)
        public override view authorized
        returns (bool success, bytes memory out_data) {

        (success, out_data) = in_contract.staticcall{gas: gasleft()}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }
}