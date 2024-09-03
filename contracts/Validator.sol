// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


// A validator contract can forward calls to an account contract when
// its credential is validated.
contract Validator {
    type CredentialType is uint32;

    // Some examples defined. Can be extended to other types.
    CredentialType public constant CUSTODIAN = CredentialType.wrap(1);
    CredentialType public constant PASSWORD = CredentialType.wrap(2);

    struct Credential {
        CredentialType credType;
        bytes credData;
    }

    mapping (address => Credential) private credentials;

    constructor(address account, Credential memory credential) {
        credentials[account] = credential;
    }

    // Validate the provided credential data.
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
        require(validate(account, credData), "Specified credentials invalid");
        _;
    }

    // Update the credential for this account to the new values.
    function updateCredential(
        address account,
        bytes calldata credData,
        CredentialType newCredType,
        bytes calldata newCredData)
    virtual external authorized(account, credData) {
        credentials[account] = Credential(newCredType, newCredData);
    }

    // Call a view function in the account, after credential is validated.
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

    // Call a state-changing function in the account after credential is validated
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