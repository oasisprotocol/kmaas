import { ethers } from "hardhat";
import { ErrorDecoder } from 'ethers-decode-error'

const { expect } = require("chai");

const errorDecoder = ErrorDecoder.create()

describe('Basic test', () => {
    var kmaasInstance;
    var account1;
    var account2;

    // Call the contract factory to get the per-user instance of the actual KMaaS contract
    before(async function () {
        // This before function also tests out the lightweight-clone pattern
        this.timeout(100000);
        [account1, account2] = await ethers.getSigners();
        const kmaasContractFactory = await ethers.getContractFactory('Account', account1);
        var kmaasMasterContract = await kmaasContractFactory.deploy()
        await kmaasMasterContract.waitForDeployment();
        const kmaasMasterContractAddr = await kmaasMasterContract.getAddress();
        const factory = await ethers.getContractFactory('AccountFactory', account1);
        const contract = await factory.deploy();
        await contract.waitForDeployment();
        const kmaasTx = await contract.createProxy(kmaasMasterContractAddr);
        const kmaasReceipt = await kmaasTx.wait();
        // Grab the KMaaS Account address from the events of the transaction
        const kmaasAddress = kmaasReceipt.logs[0].args[0];
        kmaasInstance = await ethers.getContractAt('Account', kmaasAddress);
        const initializeTx = await kmaasInstance.initialize(account1.address);
        await initializeTx.wait();
    });


    // Here should define a contract and before function to deploy the KMaaS contract
    it('Correctly detects controller', async () => {
        const hasPermission = await kmaasInstance.hasPermission(account1.address);
        expect(hasPermission).to.equal(true);
    });

    it('Can add and remove account to KMaaS', async () => {
        var kmaasInstanceAcc2 = kmaasInstance.connect(account2);
        // Grant permission to account 2 for an hour
        var expiry = Date.now() + 60*60*1000;
        var filler = ethers.encodeBytes32String("filler");
        var tx = await kmaasInstance.grantPermission(account2.address, expiry);
        await tx.wait();
        var permission = await kmaasInstance.hasPermission(account2.address);
        expect(permission).to.equal(true);
        // Revoke permission
        tx = await kmaasInstance.revokePermission(account2.address);
        await tx.wait();
        // Dummy operation just to make sure account2 doesn't have permission
        var permission = await kmaasInstance.hasPermission(account2.address);
        expect(permission).to.equal(false);
    });

    it('Signs digest successfully', async () => {
        var message = "signature needed";
        var hash = ethers.hashMessage(message);
        var kmaasSignature = await kmaasInstance.sign(hash);
        var recoveredAddress = ethers.verifyMessage(message, kmaasSignature)
        var publicKey = await kmaasInstance.publicKey();
        expect(recoveredAddress).to.equal(publicKey);
    });

    it("Signs and executes transaction successfully", async () => {
        // Send some eth from the KMaaS instance's stored public key and check that the balance of that address drops
        var kmaasAddress = await kmaasInstance.publicKey();
        // Send some eth to the address stored by KMaaS
        var fundTx = await account1.sendTransaction({to: kmaasAddress, value: ethers.parseEther("0.1")})
        await fundTx.wait()

        var initBalance = await account1.provider.getBalance(kmaasAddress);
        // Sign a transaction for that address that basically just burns some of the token that it was sent
        var burnTx = {
            'nonce': 0,
            'gasPrice': 100000000000,
            'gasLimit': 250000,
            'to': ethers.ZeroAddress,
            'value': ethers.parseEther("0.05"),
            'data': '0x00',
            'chainId': '0x5afd'
        }

        var burnTxSigned = await kmaasInstance.signEIP155(burnTx);
        var burnTxResponse = await account1.provider.broadcastTransaction(burnTxSigned);
        await burnTxResponse.wait()
        // Verify that stored public key has less balance in it
        var finalBalance = await account1.provider.getBalance(kmaasAddress);
        expect(finalBalance).to.be.lessThan(initBalance);
    });


    it('Successfully calls other contracts', async () => {
        // Define contract in-line that requires the sender to be the address stored in the kmaas contract
        var publicKey = await kmaasInstance.publicKey();
        var contractFactory = await ethers.getContractFactory("Test");
        var testContract = await contractFactory.deploy();
        await testContract.waitForDeployment();

        var testContractAddress = await testContract.getAddress();
        var calldata = testContract.interface.encodeFunctionData("incrementCounter", []);
        var tx = await kmaasInstance.call(testContractAddress, calldata);
        await tx.wait();

        var counter = await testContract.counter();
        expect(counter).to.equal(1);
    });
});