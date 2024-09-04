/*
What are the tests that are necessary to write here?
- Different functionality:
    1. Ability to generate a) public/private keypair b) symmetric key with various expiration times (helper function to use symmetric key for a single epoch)
    2. Emit event when  master key rotates? still not sure what exactly this is
    3. Use of either validator contract or EOA to access keys
    4. Ability to delegate control and correct ACL w.r.t. expiration times
*/
// import { ethers } from "hardhat";
import { ethers } from "hardhat";
import { parseEther, Wallet } from 'ethers';
import { ErrorDecoder } from 'ethers-decode-error'

const { expect } = require("chai");

const errorDecoder = ErrorDecoder.create()

describe('Basic test', () => {
    var kmaasInstance;
    var account1;
    var account2;

    // Call the contract factory to get the per-user instance of the actual KMaaS contract
    before(async function () {
        this.timeout(100000);
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
            - What is the way that it's supposed to work?
                - The only way that I can see for msg.sender to be the KMaaS account is for the transaction to be signed by the KMaaS
                account and then broadcasted by the end-user. I think this would still allow the KMaaS account to pay gas
                - So what's the reason the gasless contract calls itself?
                    - Maybe the best way to test this is just to emit an event to test who the msg.sender is
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

    it('Signs digest successfully', async () => {
        // So when I add the prefix and use ethers.id this doesn't work
        var message = "signature needed";
        var hash = ethers.hashMessage(message);
        // Signing the message with a KMaaS-authorized key
        var s = await account1.signMessage(message);
        var signature = ethers.Signature.from(s);
        var signatureRSV = {
            'r': signature.r,
            's': signature.s,
            'v': signature.v
        }
        var kmaasSignature = await kmaasInstance.sign(hash, signatureRSV);
        var recoveredAddress = ethers.verifyMessage(message, kmaasSignature)
        var publicKey = await kmaasInstance.publicKey();
        expect(recoveredAddress).to.equal(publicKey);
    });

    it('Test msg sender', async function () {
        this.timeout(100000);
        /*
            How does this need to work? Maybe I can just use the signTransaction utility with ethers?
            - Create a dummy transaction by calling a function on the KMaaS instance
            - Sign the transaction using ethers
            - Pass in the transaction and the signature into the KMaaS instance to get the transaction signature
            - Verify that the signature is correct
        */

        var kmaasAddress = await kmaasInstance.getAddress();
        var publicKey = await kmaasInstance.publicKey();
        console.log("Sending ether to KMaaS account")
        try {
            const tx = await account1.sendTransaction({
                to: publicKey,
                value: ethers.parseEther('0.1'),
                data: '0x'
            });
            await tx.wait();
            console.log("Finished sending ether");
        } catch (err) {
            const { reason } = await errorDecoder.decode(err)
            console.log('Revert reason:', reason)
        }


        const factory = await ethers.getContractFactory('Sender', account1);
        const testContract = await factory.deploy();
        await testContract.waitForDeployment();

        var testContractAddress = await testContract.getAddress();
        var accountAddress = account1.address
        console.log(`KMaaS address is ${kmaasAddress} and account address is ${accountAddress} and test contract address is ${testContractAddress}`)

        const directTx = await testContract.emitSender();
        const directReceipt = await directTx.wait();
        console.log(`Address returned by directly calling the function is ${directReceipt.logs[0].args[0]}`);

        const functionData = testContract.interface.encodeFunctionData("emitSender", []);

//         const signedProxyTransaction = await kmaasInstance.makeProxyTx(await testContract.getAddress(), functionData);
//         const txResponse = await account1.provider.broadcastTransaction(signedProxyTransaction)
//         const txReceipt = await txResponse.wait();
//         console.log("Receipt of proxy transaction since other stuff isn't working")
//         console.log(txReceipt)
//         console.log(`Address returned by proxy transaction is ${txReceipt.logs[0].args[0]}`);

        /*
            struct EthTx {
                uint64 nonce;
                uint256 gasPrice;
                uint64 gasLimit;
                address to;
                uint256 value;
                bytes data;
                uint256 chainId;
            }
        */
        const transactionData = {
            'nonce': 1,
            'gasPrice': 100000000000,
            'gasLimit': 25000,
            'to': testContractAddress,
            'value': ethers.parseEther('0.0'),
            'data': functionData,
            'chainId': 23295
        }
        const dummySignature = {
            'r': 0,
            's': 0,
            'v': 0
        }
        const signedTransaction = await kmaasInstance.signEIP155(transactionData, dummySignature);
        const signedTxResponse = await account1.provider.broadcastTransaction(signedTransaction)
        const signedTxReceipt = await signedTxResponse.wait()
        console.log(`Address returned by signed transaction is ${signedTxReceipt.logs[0].args[0]}`);
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