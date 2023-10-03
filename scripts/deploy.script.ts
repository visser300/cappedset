import { ethers } from 'hardhat'

async function main() {
  const CappedSet = await ethers.getContractFactory('CappedSet')
  const instance = await CappedSet.deploy(100)
  console.log('CappedSet deployed to:', instance.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
