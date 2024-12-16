import { task } from "hardhat/config"

task("deploy", "📰 Deploys a contract with the given constructor arguments.")
  .addParam("contract", "Name of the contract to deploy.", "Account")
  .addOptionalVariadicPositionalParam(
    "args",
    "Constructor arguments for the contract"
  )
  .setAction(async (args, { viem, network, run }) => {
    console.log("\n=== 📦 Deploy Process Started ===\n")

    try {
      console.log("🔨 Compiling contracts...")
      await run("compile")

      console.log(`\n🚀 Deploying ${args.contract} to ${network.name}...`)
      const Contract = await viem.deployContract(args.contract, args.args)

      console.log("\n✅ Deployment successful!")
      console.log("📄 Contract address:", Contract.address)

      console.log("\n=== 🎉 Deploy Process Complete ===\n")
      return Contract
    } catch (error) {
      console.error("\n❌ Deploy Process Failed!")
      console.error("Error details:", error instanceof Error ? error.message : error)
      console.error("\n=== 🚫 Deploy Process Terminated ===\n")
      throw error
    }
  })
