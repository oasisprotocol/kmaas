import { ethers } from "hardhat";

const { expect } = require("chai");


describe("Validator test", function () {
    /*
        What do I want to test here?
        Create a validator contract in before clause

        - authenticate to validator contract
        - change authentication and test authentication again

    */

    var kmaasInstance;
    var kmaasAddress;
    var account1;
    var validator;
    var cred;

    // Call the contract factory to get the per-user instance of the actual KMaaS contract
    before(async function () {
        this.timeout(120000);
        [account1] = await ethers.getSigners();
        const factory = await ethers.getContractFactory('AccountFactory', account1);
        console.log("AccountFactory");
        const contract = await factory.deploy();
        console.log("tx submitted");
        await contract.waitForDeployment();
        console.log("factory contract deployed");
        const kmaasTx = await contract.clone(account1.address);
        console.log("kmaas instance deployed");
        const kmaasReceipt = await kmaasTx.wait();
        kmaasAddress = kmaasReceipt.logs[0].args[0];
        kmaasInstance = await ethers.getContractAt('Account', kmaasAddress);
        console.log(`kmaas fully deployed ${kmaasAddress}`);

        cred = {
            'credType': 2,
            'credData': ethers.encodeBytes32String("password!")
        };

        const validatorFactory = await ethers.getContractFactory('Validator', account1);
        console.log("validator factory");
        validator = await validatorFactory.deploy(await kmaasInstance.getAddress(), cred);
        console.log("validator submitted");
        await validator.waitForDeployment();
        var validatorAddress = await validator.getAddress();
        console.log(`validator finished deploying ${validatorAddress}`);

        // Change the controller to the validator contract
        var expiry = Date.now() + 60*60*1000;
        var grantTx = await kmaasInstance.grantPermission(account1.address, expiry);
        console.log("grant tx submitted");
        await grantTx.wait();
        console.log("grant tx finished");
        var controllerTx = await kmaasInstance.updateController(await validator.getAddress());
        console.log("controller tx submitted");
        await controllerTx.wait();
        console.log("controller tx finished");
    });

    it('should authenticate correctly', async () => {
        // First attempt is formatting both the address and the credential as the
        var hasPermission = await validator.validate(kmaasAddress, cred.credData);
        expect(hasPermission).to.equal(true);
    });

    // Should update credential correctly
    it('should update the credentials correctly', async () => {
        var newPassword = ethers.encodeBytes32String("test123");
        var updateCredTx = await validator.validate(kmaasAddress, cred.credData, 2, newPassword);
        cred.credData = newPassword;
    });

    // Should call KMaaS functions correctly
    it('should delegate KMaaS function calls correctly', async () => {

    });
})