// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IAccountFactory } from "./interfaces/IAccountFactory.sol";
import { IErrors } from "./interfaces/IErrors.sol";
import { Account } from "./Account.sol";

/// @title Factory contract for Account creation
/// @notice Handles deployment of new Account instances using minimal proxies
contract AccountFactory is IAccountFactory, IErrors {
    /// @notice Mapping of account types to their implementation addresses
    mapping(AccountType => address) private implementations;

    /// @notice Initializes the factory with implementation addresses
    /// @param _basicImpl The implementation address for basic accounts
    /// @param _symKeyImpl The implementation address for symmetric key accounts
    /// @param _permKeyImpl The implementation address for permissioned key accounts
    /// @dev All implementation addresses must be non-zero
    constructor(address _basicImpl, address _symKeyImpl, address _permKeyImpl) {
        if (_basicImpl == address(0) || _symKeyImpl == address(0) || _permKeyImpl == address(0)) revert ZeroAddress();

        implementations[AccountType.Basic] = _basicImpl;
        implementations[AccountType.SymKey] = _symKeyImpl;
        implementations[AccountType.PermKey] = _permKeyImpl;
    }

    /// @inheritdoc IAccountFactory
    function deployAccountWithType(
        address owner,
        AccountType accountType
    ) external override returns (address accountAddress) {
        if (owner == address(0)) revert ZeroAddress();

        address implementation = implementations[accountType];
        if (implementation == address(0)) revert InvalidAccountType();

        accountAddress = _cloneProxy(implementation);
        Account(accountAddress).transferOwnership(owner);
        emit AccountCreated(accountAddress, uint8(accountType));
    }

    /// @dev Creates minimal proxy clone of implementation
    /// @param implementation The address of the implementation contract to clone
    /// @return instance The address of the newly created proxy contract
    /// @dev Uses EIP-1167 minimal proxy pattern
    function _cloneProxy(address implementation) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(96, implementation))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
    }
}
