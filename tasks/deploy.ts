import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task('deploy', 'Deploy the specified contract')
    .addPositionalParam("contractName")
    .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
        const contractName = args["contractName"];
        const factory = await hre.ethers.getContractFactory(contractName);
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const address = await contract.getAddress();
        console.log(`Address: ${address}`);
    });

task('kmaas_setup', 'Set up KMaaS account and Validator contract')
    .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
        const kmaasContractFactory = await hre.ethers.getContractFactory("AccountWithSymKey");
        const kmaasContract = await kmaasContractFactory.deploy();
        await kmaasContract.waitForDeployment();
        const [account] = await hre.ethers.getSigners();
        const initializeTx = await kmaasContract.initialize(account.address);
        await initializeTx.wait();
        const kmaasAddress = await kmaasContract.getAddress();
        console.log(`KMaaS contract at ${kmaasAddress} initialized`)
        const publicKey = await kmaasContract.publicKey();
        console.log(`KMaaS contract has public key ${publicKey}`);

        const validatorContractFactory = await hre.ethers.getContractFactory("ValidatorWithSiwe");
        const validatorContract = await validatorContractFactory.deploy("localhost");
        await validatorContract.waitForDeployment();
        const cred = {
              'credType': 2,
              'credData': hre.ethers.encodeBytes32String("test123")
          };
        const addAccountTx = await validatorContract.addAccount(await kmaasContract.getAddress(), cred);
        await addAccountTx.wait();
        const validatorAddress = await validatorContract.getAddress();
        console.log(`Validator contract at ${validatorAddress} initialized`);

        const updateControllerTx = await kmaasContract.updateController(validatorAddress);
        await updateControllerTx.wait();
        console.log("Kmaas contract now has validator controller");
    });