import { ethers } from "hardhat";

const { expect } = require("chai");


describe("Validator test", function () {
    var kmaasInstance;
    var kmaasAddress;
    var account1;
    var validator;
    var cred;

    // Call the contract factory to get the per-user instance of the actual KMaaS contract
    before(async function () {
        this.timeout(120000);
        [account1] = await ethers.getSigners();
        const kmaasFactory = await ethers.getContractFactory('Account', account1);
        kmaasInstance = await kmaasFactory.deploy();
        await kmaasInstance.waitForDeployment();
        kmaasAddress = await kmaasInstance.getAddress();

        const initializeTx = await kmaasInstance.initialize(account1.address);
        await initializeTx.wait();

        cred = {
            'credType': 2,
            'credData': ethers.encodeBytes32String("password!")
        };

        const validatorFactory = await ethers.getContractFactory('Validator', account1);
        validator = await validatorFactory.deploy(await kmaasInstance.getAddress(), cred);
        await validator.waitForDeployment();
        var validatorAddress = await validator.getAddress();
        var addAccountTx = await validator.addAccount(kmaasAddress, cred);
        await addAccountTx.wait();

        // Change the controller to the validator contract
        var expiry = Date.now() + 60*60*1000;
        var grantTx = await kmaasInstance.grantPermission(account1.address, expiry);
        await grantTx.wait();
        var controllerTx = await kmaasInstance.updateController(await validator.getAddress());
        await controllerTx.wait();
    });

    it('should authenticate correctly', async () => {
        // First attempt is formatting both the address and the credential as the
        var hasPermission = await validator.validate(kmaasAddress, cred.credData);
        expect(hasPermission).to.equal(true);
    });

    // Should update credential correctly
    it('should update the credentials correctly', async () => {
        var newPassword = ethers.encodeBytes32String("test123");
        var updateCredTx = await validator.updateCredential(kmaasAddress, cred.credData, 2, newPassword);
        await updateCredTx.wait();

        // Reset back to old password
        var resetCredTx = await validator.updateCredential(kmaasAddress, newPassword, 2, cred.credData)
        await resetCredTx.wait()
    });

    it('should delegate KMaaS function calls correctly', async () => {
        var text = "data to encrypt";
        var digest = ethers.hashMessage(text);
        var functionData = kmaasInstance.interface.encodeFunctionData("sign", [digest]);
        var success, digestSignature;
        [success, digestSignature] = await validator.callAccount(kmaasAddress, cred.credData, functionData);
        var digestSignatureR = "0x" + digestSignature.slice(2, 66);
        var digestSignatureS = "0x" + digestSignature.slice(66, 130)
        var digestSignatureV = "0x" + digestSignature.slice(130, 194);
        var digestSignatureObj = ethers.Signature.from({
            "r": digestSignatureR,
            "s": digestSignatureS,
            "v": digestSignatureV
        })

        // Verify the signature
        var publicKey = await kmaasInstance.publicKey();
        var recoveredAddress = ethers.verifyMessage(text, digestSignatureObj)
        expect(recoveredAddress).to.equal(publicKey);
    });
})