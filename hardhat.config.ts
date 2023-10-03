import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config()

const mnemonic = process.env.LOCAL_MNEMONIC ?? ''
const deployPrivateKey = process.env.DEPLOY_PRIVATE_KEY ?? ''

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337, // for test
      accounts: { mnemonic: mnemonic },
      mining: {
        auto: false,
        interval: 5000,
      },
    },
    mumbai: {
      url: process.env.RPC_URL, // rpc url
      accounts: [deployPrivateKey], // private key for deployment
      chainId: 80001,
      gas: 'auto',
      gasPrice: 'auto',
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: '9TJ4C4B3V7F28HBZN41AK513TTXYQBJ55F'
    }
  },
}

export default config
