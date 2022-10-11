
import { expect } from "chai";
import {ethers} from 'hardhat';
import { Contract } from "ethers";
const init = require("../test-init");
const testConfig = require("../test-config");
const timeUtil = require('../util/move');

const deploy = async () => {
  const setup = await init.initialize(await ethers.getSigners());

  setup.data = {};

  return setup;
};

describe("Contract: Staking Factory", function () {
  let setup;
  let owner: any;
  let beneficiary: any;
  let stakingFactoryContract: Contract;

  //This method will be executed before each test to setup all variables.
  beforeEach(async function () {
    setup = await deploy();
    owner = setup.roles.root;
    beneficiary = setup.roles.beneficiary;
    stakingFactoryContract = await init.getContractInstance("StakingFactory", owner, []);
  })

  context("Deployment", function () {
    it("Should deploy an instance of StakingFactory contract", async function () {
      expect(stakingFactoryContract.address).not.to.equal(ethers.constants.AddressZero);
    });
  });

  context("Staking contract and tokens deployment", function () {
    it("From given names, it'll deploy a staking contract with new tokens", async function () {
      const tx = await stakingFactoryContract.deployStakingContractAndTokens("Staking Token", "STT", "Rewards Token", "RWT");
      const rec = await tx.wait();
      const contractAddress = rec.events.filter((event: any) => event.event == 'StakingContractCreated')[0].args['contractAddress'];
      const stakingTokenAddress = rec.events.filter((event: any) => event.event == 'StakingContractCreated')[0].args['stakingToken'];
      const rewardsTokenAddress = rec.events.filter((event: any) => event.event == 'StakingContractCreated')[0].args['rewardsToken'];
      expect(contractAddress).not.to.equal(ethers.constants.AddressZero);
      expect(stakingTokenAddress).not.to.equal(ethers.constants.AddressZero);
      expect(rewardsTokenAddress).not.to.equal(ethers.constants.AddressZero);
    });

    it("It'll deploy staking contract and tokens with Owner user as its owner.", async function () {
      const tx = await stakingFactoryContract.deployStakingContractAndTokens("Staking Token", "STT", "Rewards Token", "RWT");
      const rec = await tx.wait();
      const contractAddress = rec.events.filter((event: any) => event.event == 'StakingContractCreated')[0].args['contractAddress'];
      const stakingTokenAddress = rec.events.filter((event: any) => event.event == 'StakingContractCreated')[0].args['stakingToken'];
      const rewardsTokenAddress = rec.events.filter((event: any) => event.event == 'StakingContractCreated')[0].args['rewardsToken'];
      
      const stakingContract = await ethers.getContractAt("Staking", contractAddress, owner);
      const stakingToken = await ethers.getContractAt("CustomToken", stakingTokenAddress, owner);
      const rewardsToken = await ethers.getContractAt("CustomToken", rewardsTokenAddress, owner);

      expect(await stakingContract.owner()).to.equal(owner.address);
      expect(await stakingToken.owner()).to.equal(owner.address);
      expect(await rewardsToken.owner()).to.equal(owner.address);
    });
  });
});
