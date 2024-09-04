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
        console.log('got signers')
        const factory = await ethers.getContractFactory('AccountFactory', account);
        console.log('got factory')
        const contract = await factory.deploy();
        console.log('deployed contract')
        await contract.waitForDeployment();
        console.log('finished deploying')
        const kmaasTx = await contract.clone(account.address);
        console.log('created instance')
        const kmaasReceipt = await kmaasTx.wait();
        console.log('finished creating instance')
        // Grab the KMaaS Account address from the events of the transaction
        const kmaasAddress = kmaasReceipt.logs[0].args[0];
        kmaasInstance = await ethers.getContractAt('AccountWithSymKey', kmaasAddress);
    });

    it("Should generate/retrieve/delete symmetric keys", async () => {
        const keyName = "key1";
        const genTx = await kmaasInstance.generateSymKey(keyName, false);
        await genTx.wait();

        const retrieveKey = await kmaasInstance.getSymKey(keyName);
    });

    it("Should encrypt and decrypt data", async () => {
        const keyName = "key1";
        try {
            const genTx = await kmaasInstance.generateSymKey(keyName, true);
            console.log('gen tx')
            await genTx.wait();
            console.log('gen receipt')
        } catch (err) {
            const { reason } = await errorDecoder.decode(err)
            console.log('Revert reason:', reason)
        }

        const plaintext = ethers.formatBytes32String("this is a test for encryption");
        const ciphertext = await kmaasInstance.encryptSymKey(keyName, plaintext, "");
        console.log('ciphertext')
        const retrievedPlaintext = await kmaasInstance.decryptSymKey(keyName, ciphertext, "");
        console.log('plaintext')
        expect(retrievedPlaintext).to.equal(plaintext);
    });

})