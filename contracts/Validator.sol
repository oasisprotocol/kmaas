// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


/// @title Contract to forward calls to an account once credentials are validated
contract Validator {
    error InvalidCredentials();
    type CredentialType is uint32;

    // Some examples defined. Can be extended to other types.
    CredentialType public constant CUSTODIAN = CredentialType.wrap(1);
    CredentialType public constant PASSWORD = CredentialType.wrap(2);

    struct Credential {
        CredentialType credType;
        bytes credData;
    }

    mapping (address => Credential) internal credentials;

    /// @notice Add an account with the specified credential to this validator
    /// @param account Address of account
    /// @param credential Credential struct with necessary data
    function addAccount(address account, Credential memory credential)
    public virtual {
        credentials[account] = credential;
    }

    /// @notice Validates provided credential for given account
    /// @param account Address of account
    /// @param credData credential bytes to authenticate with
    function validate(address account, bytes calldata credData)
    public virtual view
    returns (bool) {
        if (CredentialType.unwrap(credentials[account].credType) == 0 || credentials[account].credData.length == 0) {
            return false;
        } else {
            return keccak256(credentials[account].credData) == keccak256(credData);
        }
    }

    modifier authorized(address account, bytes calldata credData) {
        if (!validate(account, credData)) {
            revert InvalidCredentials();
        }
        _;
    }

    /// @notice Update the credential for this account to the new values.
    /// @param account Account to update
    /// @param credData Current credentials to authenticate
    /// @param newCredType New credential type
    /// @param newCredData New credential data
    function updateCredential(
        address account,
        bytes calldata credData,
        CredentialType newCredType,
        bytes calldata newCredData)
    virtual external authorized(account, credData) {
        credentials[account] = Credential(newCredType, newCredData);
    }

    /// @notice Call a view/pure function in the account, after credential is validated.
    /// @param account Account to call
    /// @param credential Credentials to authorize with
    /// @param in_data Encoded function data to pass to account
    /// @return success Whether the call was successful
    /// @return out_data Data returned by contract
    function callAccount(
        address account,
        bytes calldata credential,
        bytes calldata in_data)
    virtual external view authorized(account, credential)
    returns (bool success, bytes memory out_data) {
        (success, out_data) = account.staticcall(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }

    /// @notice Call a state-changing function in the account, after credential is validated.
    /// @param account Account to call
    /// @param credential Credentials to authorize with
    /// @param in_data Encoded function data to pass to account
    /// @return success Whether the call was successful
    /// @return out_data Data returned by contract
    function transactAccount(
        address account,
        bytes calldata credential,
        bytes calldata in_data)
    virtual external payable authorized(account, credential)
    returns (bool success, bytes memory out_data) {
        (success, out_data) = account.call{value: msg.value}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }
}