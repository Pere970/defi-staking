import {ethers} from 'hardhat';

const initialize = async (accounts: any) => {
  const setup : any = {};
  setup.roles = {
    root: accounts[0],
    beneficiary: accounts[1],
  };

  return setup;
};

const getContractInstance = async (factoryName: string, address: any, args: any) => {
  const Factory = await ethers.getContractFactory(factoryName, address);
  const parameters = args ? args : [];
  return await Factory.deploy(...parameters);
};

const gettokenInstances = async (setup: any) => {
  const Token_Factory = await ethers.getContractFactory(
    "CustomToken",
    setup.roles.root
  );
  const stakingToken = await Token_Factory.deploy("Staking Token", "STT");
  const rewardsToken = await Token_Factory.deploy("Rewards Token", "RWT");
  return { 
    stakingToken,
    rewardsToken
 };
};

module.exports = {
  initialize,
  gettokenInstances,
  getContractInstance,
};