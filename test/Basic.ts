/*
What are the tests that are necessary to write here?
- Different functionality:
    1. Ability to generate a) public/private keypair b) symmetric key with various expiration times (helper function to use symmetric key for a single epoch)
    2. Emit event when  master key rotates? still not sure what exactly this is
    3. Use of either validator contract or EOA to access keys
    4. Ability to delegate control and correct ACL w.r.t. expiration times
*/
import { ethers } from "hardhat";
import { Account } from "../contracts/Account";

const { expect } = require("chai");

describe('Basic test', () => {
    var kmaasInstance;
    var account1;
    var account2;

    // Call the contract factory to get the per-user instance of the actual KMaaS contract
    before(async () => {
        [account1, account2] = await ethers.getSigners();
        const factory = await ethers.getContractFactory('AccountFactory', account1);
        console.log("here we are");
        const contract = await factory.deploy();
        console.log("tx submitted");
        await contract.waitForDeployment();
        console.log("contract deployed");
        const kmaasTx = await contract.clone(account1.address);
        console.log("instance deployed");
        const kmaasReceipt = await kmaasTx.wait();
        // Grab the KMaaS Account address from the events of the transaction
        const kmaasAddress = kmaasReceipt.logs[0].args[0];
        kmaasInstance = await ethers.getContractAt('Account', kmaasAddress);
    });


    // Here should define a contract and before function to deploy the KMaaS contract
    it('Correctly detects controller', async () => {
        const hasPermission = await kmaasInstance.hasPermission(account1.address);
        expect(hasPermission).to.equal(true);
    });

    /*
        What are all the other basic tests of functionality?
            - a lot of these ACL tests require two accounts so need to create another one
            - Update controller and check whether new controller can access / old controller cannot
                - So for this need two accounts
            - grant / revoke permission work properly
            - signs call data correctly. How do I verify this?
                - Use public key to verify signature? Maybe the better test is to mock calldata to another contract and then
                check whether the calldata returned by the function is able to successfully call the other function
    */

    it('Can add and remove account to KMaaS', async () => {
        var kmaasInstanceAcc2 = kmaasInstance.connect(account2);
        // Grant permission to account 2 for an hour
        var expiry = Date.now() + 60*60*1000;
        var filler = ethers.encodeBytes32String("filler");
        var tx = await kmaasInstance.grantPermission(account2.address, expiry);
        await tx.wait();
        // Dummy operation just to make sure account2 has permission
        tx = await kmaasInstanceAcc2.updateController(account1.address);
        await tx.wait()
        // Revoke permission
        tx = await kmaasInstance.revokePermission(account2.address);
        await tx.wait();
        // Dummy operation just to make sure account2 doesn't have permission
        var permission = await kmaasInstance.hasPermission(account2.address);
        expect(permission).to.equal(false);
    });

    it('Signs digest and transaction', async () => {
        var message = "signature needed"


        // This is an address so there shouldn't be any UTF-8 conversions I need to do right
        var publicKey = await kmaasInstance.publicKey();
        var toSign = ethers.encodeBytes32String(message);
        var signature = await kmaasInstance.sign(toSign) // ethers.Signature.from(await kmaasInstance.sign(toSign));

        // Create dummy transaction to sign
        var transaction = {
            'nonce': 0,
            'gasPrice': 100000,
            'gasLimit': 25000,
            'to': await kmaasInstance.getAddress(),
            'value': 0,

        }



        // Verify signature?
        /* var verifiedPublicKey = await ethers.verifyMessage(toSign, signature);
        console.log(`verified public key ${verifiedPublicKey}`);
 */
    });

    it('Successfully calls contract on behalf of stored keys', async () => {
        // Define contract in-line that requires the sender to be the address stored in the kmaas contract

        var publicKey = await kmaasInstance.publicKey();

        var contractFactory = await ethers.getContractFactory("Test");
        console.log("got contract factory");
        var testContract = await contractFactory.deploy(publicKey);
        console.log("deployed");
        await testContract.waitForDeployment();
        console.log("Finished waiting")

        var testContractAddress = await testContract.getAddress();
        console.log(`Address of test contract ${testContractAddress}`)
        var kmaasInstanceAddress = await kmaasInstance.getAddress();
        console.log(`Address of kmaas instance ${kmaasInstanceAddress}`);
        // Call the test contract directly to make sure that it fails
//         var notSender = await testContract.verifySender();
//         expect(notSender).to.equal(false);
//         console.log("verified wrong sender fails")

//         await expect(testContract.verifySender()).to.be.reverted;

//         var signedTx = await kmaasInstance.makeProxyTx(await testContract.getAddress(), calldata);
//         console.log("signed tx");
//         var response = await account1.provider.broadcastTransaction(signedTx);
//         console.log("broadcasted transaction");
//         var receipt = await response.wait();
//         console.log(receipt)

        var calldata = testContract.interface.encodeFunctionData("verifySender", []);
        var tx = await kmaasInstance.staticcall(testContractAddress, calldata);
        console.log(tx);
        // TODO Need to check the return values here
//         console.log(tx);
//         console.log("submitted tx to call function of kmaas")
//         var response = await tx.wait();
//         console.log(kmaasInstance.interface.decodeFunctionResult("call", tx.data));
        // Define calldata for KMaaS instance to be able to call this test contract

    });
});

