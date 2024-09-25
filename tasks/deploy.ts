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
        const kmaasFactoryFactory = await hre.ethers.getContractFactory("AccountFactory");
        const kmaasFactory = await kmaasFactoryFactory.deploy();
        await kmaasFactory.waitForDeployment();
        const kmaasFactoryAddress = await kmaasFactory.getAddress();
        console.log(`Kmaas Factory Address ${kmaasFactoryAddress}`);

        const kmaasContractFactory = await hre.ethers.getContractFactory("AccountWithSymKey");
        const kmaasContract = await kmaasContractFactory.deploy();
        await kmaasContract.waitForDeployment();
        const kmaasMasterContractAddr = await kmaasContract.getAddress();
        console.log(`Address of master contract ${kmaasMasterContractAddr}`);

        const validatorContractFactory = await hre.ethers.getContractFactory("ValidatorWithSiwe");
        const validatorContract = await validatorContractFactory.deploy("localhost");
        await validatorContract.waitForDeployment();

        const validatorAddress = await validatorContract.getAddress();
        console.log(`Validator contract at ${validatorAddress} initialized`);

        const loggingFactory = await hre.ethers.getContractFactory("Logging");
        const loggingContract = await loggingFactory.deploy();
        await loggingContract.waitForDeployment();
        const loggingContractAddr = await loggingContract.getAddress();
        console.log(`Logging contract at ${loggingContractAddr}`);
    });