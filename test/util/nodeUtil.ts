import { network } from "hardhat";

export const mine = async (blockNumber: number) => {
  await Promise.all(
    Array(blockNumber)
      .fill(0)
      .map((_) => {
        return network.provider.send("evm_mine");
      })
  );
};
