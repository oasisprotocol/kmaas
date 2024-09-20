// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// For use in the sample notes application
import {Validator} from "./Validator.sol";
import {AccountWithSymKey} from "./AccountWithSymKey.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Bearer} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";
import {A13e} from "@oasisprotocol/sapphire-contracts/contracts/auth/A13e.sol";
import {SignatureRSV} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {SiweParser, ParsedSiweMessage} from "@oasisprotocol/sapphire-contracts/contracts/SiweParser.sol";

// Contract adapted from https://api.docs.oasis.io/sol/sapphire-contracts/contracts/auth/SiweAuth.sol/contract.SiweAuth.html
contract ValidatorWithSiwe is Validator {
    /// A mapping of revoked bearers. Access it directly or use the checkRevokedBearer modifier.
    mapping(bytes32 => bool) internal _revokedBearers;

    /// The bearer token was revoked
    error RevokedBearer();

    /**
     * @notice Reverts if the given bearer was revoked
     */
    modifier checkRevokedBearer(bytes calldata bearer) {
        if (_revokedBearers[keccak256(bearer)]) {
            revert RevokedBearer();
        }
        _;
    }

    /// Domain which the dApp is associated with
    string private _domain;
    /// Default bearer token validity, if no expiration-time provided
    uint256 private constant DEFAULT_VALIDITY = 24 hours;

    /// Chain ID in the SIWE message does not match the actual chain ID
    error ChainIdMismatch();
    /// Domain in the SIWE message does not match the domain of a dApp
    error DomainMismatch();
    /// User address in the SIWE message does not match the message signer's address
    error AddressMismatch();
    /// Recovered signer does not match the specified KMaaS account
    error WrongSigner();
    /// The Not before value in the SIWE message is still in the future
    error NotBeforeInFuture();
    /// The bearer token validity or the Expires value in the SIWE message is in the past
    error Expired();

    constructor(string memory inDomain) {
        _domain = inDomain;
    }

    // This should receive the SiWE message and return the token
    // It needs to verify that the SiwE message was signed with the KMaaS account
    function login(address account, string calldata siweMsg, SignatureRSV calldata sig)
    external
    view
    returns (bytes memory)
    {
        Bearer memory b;

        // Derive the user's address from the signature.
        bytes memory eip191msg = abi.encodePacked(
            "\x19Ethereum Signed Message:\n",
            Strings.toString(bytes(siweMsg).length),
            siweMsg
        );
        address addr = ecrecover(
            keccak256(eip191msg),
            uint8(sig.v),
            sig.r,
            sig.s
        );
        b.userAddr = addr;

        ParsedSiweMessage memory p = SiweParser.parseSiweMsg(bytes(siweMsg));

        if (p.chainId != block.chainid) {
            revert ChainIdMismatch();
        }

        if (keccak256(p.schemeDomain) != keccak256(bytes(_domain))) {
            revert DomainMismatch();
        }
        b.domain = string(p.schemeDomain);

        AccountWithSymKey acc = AccountWithSymKey(account);
        if (addr != acc.publicKey()) {
            revert WrongSigner();
        }

        if (p.addr != addr) {
            revert AddressMismatch();
        }

        if (
            p.notBefore.length != 0 &&
            block.timestamp <= SiweParser.timestampFromIso(p.notBefore)
        ) {
            revert NotBeforeInFuture();
        }

        if (p.expirationTime.length != 0) {
            // Compute expected block number at expiration time.
            uint256 expirationTime = SiweParser.timestampFromIso(
                p.expirationTime
            );
            b.validUntil = expirationTime;
        } else {
            // Otherwise, just take the default validity.
            b.validUntil = block.timestamp + DEFAULT_VALIDITY;
        }
        if (block.timestamp >= b.validUntil) {
            revert Expired();
        }

        // Assumes a key named "tokenSigner" that exists in the KMaaS account
        bytes memory encB = acc.encryptSymKey("tokenSigner", abi.encode(b));
        return encB;
    }

    /**
     * @notice Return the domain associated with the dApp.
     */
    function domain() public view returns (string memory) {
        return _domain;
    }

    function authMsgSender(address acc, bytes calldata bearer)
    public
    view
    checkRevokedBearer(bearer)
    returns (address)
    {
        AccountWithSymKey accSymKey = AccountWithSymKey(acc);
        bytes memory bearerEncoded = accSymKey.decryptSymKey("tokenSigner", bearer);
        Bearer memory b = abi.decode(bearerEncoded, (Bearer));

        if (keccak256(bytes(b.domain)) != keccak256(bytes(_domain))) {
            revert DomainMismatch();
        }
        if (b.validUntil < block.timestamp) {
            revert Expired();
        }

        return b.userAddr;


    }

    modifier validateTokenOrCred(address acc, bytes calldata credData, bool token){
        if (token) {
            address kmaasPubKey = AccountWithSymKey(acc).publicKey();
            require(authMsgSender(acc, credData) == kmaasPubKey, "Token invalid");
        } else {
            require(validate(acc, credData), "Specified credentials invalid");
        }
        _;
    }


    // Call a view function in the account, after credential is validated.
    function callAccount(
        address account,
        bytes calldata credential,
        bool token,
        bytes calldata in_data)
    virtual external view validateTokenOrCred(account, credential, token)
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
        bool token,
        bytes calldata in_data)
    virtual external payable validateTokenOrCred(account, credential, token)
    returns (bool success, bytes memory out_data) {
        (success, out_data) = account.call{value: msg.value}(in_data);
        if (!success) {
            assembly {
                revert(add(out_data, 32), mload(out_data))
            }
        }
    }




}