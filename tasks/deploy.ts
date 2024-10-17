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

task('notes_setup', 'Set up required contracts for sample application')
    .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
        console.log("PROVIDER_URL=http://localhost:8545")
        console.log("PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
        const crypto = require('crypto');
        const nextAuthSecret = crypto.randomBytes(32).toString('base64');
        console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
        const notesFactory = await hre.ethers.getContractFactory("Notes");
        const notesContract = await notesFactory.deploy();
        await notesContract.waitForDeployment();
        const notesContractAddress = await notesContract.getAddress();
        console.log(`NOTES_ADDRESS=${notesContractAddress}`);
        const loggingFactory = await hre.ethers.getContractFactory("Logging");
        const loggingContract = await loggingFactory.deploy(notesContractAddress);
        await loggingContract.waitForDeployment();
        const loggingContractAddr = await loggingContract.getAddress();
        console.log(`LOGGING_ADDRESS=${loggingContractAddr}`);
        const kmaasFactoryFactory = await hre.ethers.getContractFactory("AccountFactory");
        const kmaasFactory = await kmaasFactoryFactory.deploy();
        await kmaasFactory.waitForDeployment();
        const kmaasFactoryAddress = await kmaasFactory.getAddress();
        console.log(`ACCOUNT_FACTORY_ADDRESS=${kmaasFactoryAddress}`);
        const kmaasContractFactory = await hre.ethers.getContractFactory("AccountWithSymKey");
        const kmaasContract = await kmaasContractFactory.deploy();
        await kmaasContract.waitForDeployment();
        const kmaasMasterContractAddr = await kmaasContract.getAddress();
        console.log(`ACCOUNT_SYMKEY=${kmaasMasterContractAddr}`);
        const validatorContractFactory = await hre.ethers.getContractFactory("ValidatorWithSiwe");
        const validatorContract = await validatorContractFactory.deploy("localhost");
        await validatorContract.waitForDeployment();
        const validatorAddress = await validatorContract.getAddress();
        console.log(`VALIDATOR_ADDRESS=${validatorAddress}`);

    });