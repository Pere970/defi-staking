const { network } = require("hardhat");

const moveTime = async function (amount: number) {
  //console.log("Moving blocks...")
  await network.provider.send("evm_increaseTime", [amount]);

  //console.log(`Moved forward in time ${amount} seconds`)
};

const moveBlocks = async function (amount: number) {
  //console.log("Moving blocks...")
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

module.exports = {
  moveTime,
  moveBlocks
};