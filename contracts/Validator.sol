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
        require(CredentialType.unwrap(credentials[account].credType) != 0 && credentials[account].credData.length > 0,
            "Specified address doesn't have credentials");
        // Not sure if this needs to include credType or not
        return keccak256(credentials[account].credData) == keccak256(credData);
    }

    // Update the credential for this account to the new values.
    function updateCredential(
        address account,
        bytes calldata credData,
        CredentialType newCredType,
        bytes calldata newCredData)
    virtual external {
        require(validate(account, credData), "Specified credentials invalid");
        credentials[account] = Credential(newCredType, newCredData);
    }

    // Call a function in the account, after credential is validated.
    function callAccount(
        address account,
        bytes calldata credential,
        bytes calldata in_data)
    virtual external payable
    returns (bool success, bytes memory out_data) {
        require(validate(account, credential), "Specified credentials invalid");
        // So is this going to succeed? msg.sender should be this contract which is correct
        // I'm just not sure if the transaction data is correct - does it need to be encrypted?
        // This is probably where I need to correctly verify the functionality of KMaaS before I
        // can make meaningful progress here
        (success, out_data) = account.call{value: msg.value}(in_data);
    }
}