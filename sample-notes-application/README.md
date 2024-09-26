### Sample encrypted notes application

This notes application displays the capabilities of Oasis KMaaS in three ways:
1. Using symmetric keys to encrypt/decrypt user data
2. Using an on-chain confidential keypair to sign transactions on behalf of a user
3. Extending the Validator contract to provide authentication / authorization capabilities. As a result, the application itself
doesn't need to store passwords! 

#### Application flow

The application provides the ability for users to create and store notes with the notes being stored encrypted in the backend database
and changes to the notes logged on-chain with the transactions signed by the user's on-chain keypair. This keypair is also used to 
authenticate to the backend, which then uses the `ValidatorWithSiwe` contract to generate a bearer token that can be used after initial log-in
for the user to interact with the `ValidatorWithSiwe contract without having to provide other credentials. 

On account creation, the user is asked to provide a username and password. The backend then deploys a clone of `AccountWithSymKey` for the user
which contains a private keypair and then generates two symmetric encryption keys: 1 pair to encrypt/decrypt notes and another to sign tokens
used to authenticate to the validator. It then adds the generated account to the validator instance with the password as the credential. Upon login,
the backend fetches the public key and account address associated with a user, attempts to authenticate to the `Validator` with the password and retrieved
account address, and signs a SIWE message on their behalf to prove their identity.

For subsequent accesses to the app, the backend generates a bearer token to authenticate to the `ValidatorWithSiwe` contract to enable interaction
with the `AccountWithSymKey` clone deployed for each user. To validate each user, the backend only needs to store the user's username, the public key stored
by the `AccountWithSymKey` clone, and the address of the clone contract. The authentication follows the SIWE pattern specified by EIP-4361.

The majority of the code to interact with the `ValidatorWithSiwe` and `AccountWithSymKey` contracts is contained in the `src/lib/kmaas-client.tsx` file. The 
code that generates user sessions and stores the bearer token is found in `src/api/auth/[...nextauth]/options.ts` file. 

Note that because of the limited size of the on-chain call stack, the amount of data that can be passed to `encryptSymKey` and `decryptSymKey` functions of 
`AccountWithSymKey` is small. In production environments, it may be better to fetch the user symmetric key and encrypt/decrypt within the app itself.

#### Application setup

The application is currently configured to run locally against the `sapphire-localnet` [image](https://github.com/oasisprotocol/oasis-web3-gateway/tree/main/docker) 
and a local Postgres database. The Postgres database requires the `pg_ctl` command-line utility installed and the database can be started with
`pg_ctl start -D $DIRECTORY` with `$DIRECTORY` being a directory initialized to store Postgres state. The `sapphire-localnet` image can be started
with `docker run -it -p8545:8545 -p8546:8546 ghcr.io/oasisprotocol/sapphire-localnet` with optional flags `-test-mnemonic -n 5` specifying that the same
5 accounts should be created and funded each time the container is run. The notes application can be started with `npm run dev` run in the `sample-notes-application`
directory once dependencies are installed. Finally, the application requires an `.env` file populated with the following values:

`DATABASE_NAME`: The database to connect to of the Postgres instance
`PG_USER`: The user to connect to Postgres with
`PRIVATE_KEY`: A private key that will be used by the application to view chain state and deploy contracts
`LOGGING_ADDRESS`: The address of the contract deployed to log changes to notes
`NEXTAUTH_SECRET`: The secret for NextAuth to use to encrypt session data. This can be generated with `openssl rand -base64 32`
`VALIDATOR_ADDRESS`: The address of the validator contract used in this application. For authorization to work correctly, this will need to be 
a `ValidatorWithSiwe` contract
`ACCOUNT_FACTORY_ADDRESS`: The address of a `AccountFactory` contract
`ACCOUNT_SYMKEY`: The address of the master `AccountWithSymKey` contract to clone for each user
