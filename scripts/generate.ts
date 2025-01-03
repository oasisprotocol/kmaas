import { task } from 'hardhat/config'
import { Wallet, HDNodeWallet } from 'ethers'

task(
  'generate',
  "🌱 Generate a seed phrase with it's corresponding private and public keys."
)
  .addOptionalParam(
    'prefix',
    'Prefix the private key with a specific pattern... i.e. 0x1234'
  )
  .setAction(async (args) => {
    let wallet: HDNodeWallet

    do {
      wallet = Wallet.createRandom()
      if (!args.prefix) break
    } while (
      !args.prefix ||
      !wallet.address.toLowerCase().startsWith(args.prefix.toLowerCase())
    )

    console.log(`
✨ Accounts Generated ✨
-------------------------
Mnemonic Phrase: \x1B[32m${wallet.mnemonic?.phrase}\x1B[0m
Private Key: \x1B[32m${wallet.privateKey}\x1B[0m
Public Key: \x1B[32m${wallet.address}\x1B[0m
`)
  })
