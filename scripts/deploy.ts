import { task } from "hardhat/config"

task("deploy", "📰 Deploys Account contracts and AccountFactory")
  .setAction(async (_, { ethers, network, run }) => {
    await run("compile")

    console.log(`Deploying contracts to ${network.name}...`)

    try {
      const [deployer] = await ethers.getSigners()
      console.log(`Deploying contracts with ${deployer.address}`)

      const Account = await ethers.getContractFactory("Account")
      const basicAccount = await Account.deploy(deployer.address)
      await basicAccount.waitForDeployment()
      console.log(`📝 Basic Account implementation deployed at: ${basicAccount.target}`)

      const AccountWithSymKey = await ethers.getContractFactory("AccountWithSymKey")
      const symKeyAccount = await AccountWithSymKey.deploy(deployer.address)
      await symKeyAccount.waitForDeployment()
      console.log(`🔐 SymKey Account implementation deployed at: ${symKeyAccount.target}`)

      const AccountWithPermKey = await ethers.getContractFactory("AccountWithPermKey")
      const permKeyAccount = await AccountWithPermKey.deploy(deployer.address)
      await permKeyAccount.waitForDeployment()
      console.log(`🔑 PermKey Account implementation deployed at: ${permKeyAccount.target}`)

      const AccountFactory = await ethers.getContractFactory("AccountFactory")
      const factory = await AccountFactory.deploy(
        basicAccount.target,
        symKeyAccount.target,
        permKeyAccount.target
      )
      await factory.waitForDeployment()

      console.log(`\n📰 AccountFactory deployed at: ${factory.target}`)
      console.log("\nDeployment Summary:")
      console.log("-------------------")
      console.log(`Basic Account Implementation: ${basicAccount.target}`)
      console.log(`SymKey Account Implementation: ${symKeyAccount.target}`)
      console.log(`PermKey Account Implementation: ${permKeyAccount.target}`)
      console.log(`AccountFactory: ${factory.target}`)

    } catch (error) {
      console.error("Deployment failed:", error)
      throw error
    }
  })
