## Oasis Key Manager as a Service

This repository holds the base contracts for Oasis Key Manager as a Service. This service functions
as a wrapper around the native Oasis decentralized key manager to enable dApps and users to easily
maintain signing and symmetric keys on-chain confidentially. This means dApps can confidentially store 
user information with a decentralized root of trust or interact with user accounts on-chain without needing users
to manually set up a wallet themselves.

### Contracts

#### AccountBase.sol
Contains the abstract contracts `AccountFactoryBase` and `AccountBase` to be implemented by
derived contracts. 

#### Account.sol
An implementation of `AccountBase` - it's primary functionality is to maintain a private/public keypair
on-chain confidentially. Using this keypair, it can sign digests and transactions to be submitted on the keypair's
behalf. If funded appropriately, it can also be used as an on-chain signer to enable gasless transactions on Oasis Sapphire.
The account has one `controller` with indefinite access to the account who can then grant access to other accounts
for a finite duration.

This file also contains an `AccountFactory` which is an ERC-1167 lightweight clone factory to cheaply deploy clones of
the `Account` contract.

#### AccountWithSymKey.sol
`AccountWithSymKey` is a derived contract of `Account` that maintains a set of symmetric keys that enable on-chain encryption / decryption. These 
keys can also be retrieved for encryption / decryption in an off-chain setting. 

#### Validator.sol
This is a contract to make interfacing with KMaaS accounts easier. If set to the `controller` of a KMaaS account or granted temporary access,
it can forward calls made to it after a user authenticates with previously set credentials (e.g. passwords). This allows users to authenticate
to dApps using mechanisms that they are familiar with, and maintains a mapping of KMaaS accounts to credentials to enable an application to maintain
one validator for all KMaaS accounts they interact with.


