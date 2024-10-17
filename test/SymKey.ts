import { ethers } from "hardhat";
import { ErrorDecoder } from 'ethers-decode-error'

const { expect } = require("chai");
const errorDecoder = ErrorDecoder.create()



describe("Symmetric Keys test", () => {
    var account;
    var kmaasInstance;

    before(async function () {
        this.timeout(100000);
        [account] = await ethers.getSigners();
        const masterContractFactory = await ethers.getContractFactory('AccountWithSymKey', account);
        const masterContract = await masterContractFactory.deploy();
        await masterContract.waitForDeployment();
        const masterContractAddr = await masterContract.getAddress();

        const factoryContractFactory = await ethers.getContractFactory('AccountFactory', account);
        const factoryContract = await factoryContractFactory.deploy();
        await factoryContract.waitForDeployment();
        const kmaasTx = await factoryContract.createProxy(masterContractAddr);
        const kmaasReceipt = await kmaasTx.wait();

        // Grab the KMaaS Account address from the events of the transaction
        const kmaasAddress = kmaasReceipt.logs[0].args[0];
        kmaasInstance = await ethers.getContractAt('AccountWithSymKey', kmaasAddress);
        const initializeTx = await kmaasInstance.initialize(account.address);
        await initializeTx.wait();
     });

    it("Should generate/retrieve/delete symmetric keys", async () => {
        const keyName = "key1";
        const genTx = await kmaasInstance.generateSymKey(keyName, false);
        await genTx.wait();
        const retrievedKey = await kmaasInstance.getSymKey(keyName);
        expect(retrievedKey).to.not.equal(ethers.ZeroHash)
        const deleteTx = await kmaasInstance.deleteSymKey(keyName);
        await deleteTx.wait()
        const deletedKey = await kmaasInstance.getSymKey(keyName);
        expect(deletedKey).to.equal(ethers.ZeroHash)
    });

    it("Should encrypt and decrypt data", async () => {
        const keyName = "key2";
        const genTx = await kmaasInstance.generateSymKey(keyName, true);
        await genTx.wait();
        const plaintext = "this is a test for encryption";
        const ciphertext = await kmaasInstance.encryptSymKey(keyName, ethers.toUtf8Bytes(plaintext));
        const retrievedPlaintext = ethers.toUtf8String(await kmaasInstance.decryptSymKey(keyName, ciphertext));
        expect(retrievedPlaintext).to.equal(plaintext);
    });

})