import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Account", function () {
  async function deployment() {
    const [owner, otherAccount] = await ethers.getSigners();

    const factory = await ethers.deployContract("AccountFactory");
    await factory.waitForDeployment();

    return { owner, otherAccount, factory };
  }

  describe("Account Deployment", function () {
    it("should deploy an account", async function () {
      if ((await ethers.provider.getNetwork()).chainId != BigInt(1337)) {
        // https://github.com/oasisprotocol/sapphire-paratime/issues/197
        this.skip();
      }
      const { owner } = await loadFixture(deployment);

      const account = await ethers.deployContract("Account", [owner.address]);
      await account.waitForDeployment();

      console.log("account", account);
      expect(await account.getAddress()).to.be.properAddress;
      expect(await account.owner()).to.equal(owner.address);
    });
  });
});