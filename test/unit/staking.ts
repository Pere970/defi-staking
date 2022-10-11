
import { expect } from "chai";
import {ethers} from 'hardhat';
import { Contract } from "ethers";
const init = require("../test-init");
const testConfig = require("../test-config");
const timeUtil = require('../util/move');

const deploy = async () => {
  const setup = await init.initialize(await ethers.getSigners());

  setup.tokens = await init.gettokenInstances(setup);

  setup.data = {};

  return setup;
};

describe("Contract: Staking", function () {
  let setup;
  let owner: any;
  let beneficiary: any;
  let stakingToken: Contract;
  let rewardsToken: Contract;
  let stakingContract: Contract;

  //This method will be executed before each test to setup all variables.
  beforeEach(async function () {
    setup = await deploy();
    owner = setup.roles.root;
    beneficiary = setup.roles.beneficiary;
    stakingToken = setup.tokens.stakingToken;
    rewardsToken = setup.tokens.rewardsToken;
    stakingContract = await init.getContractInstance("Staking", owner, [stakingToken.address, rewardsToken.address]);
  })

  context("Deployment", function () {
    it("Should deploy an instance of Staking contract", async function () {
      expect(stakingContract.address).not.to.equal(ethers.constants.AddressZero);
    });

    it("Should set the right staking and rewards token", async function () {
      expect(stakingContract.address).not.to.equal(ethers.constants.AddressZero);
      expect(await stakingContract.stakingToken()).to.equal(stakingToken.address);
      expect(await stakingContract.rewardsToken()).to.equal(rewardsToken.address);
    });
  });

  context("Staking setup", function () {
    it("Should let mint the rewards token to the staking contract", async function () {
      const mintAmount = ethers.utils.parseEther('1000');
      expect(String(await rewardsToken.balanceOf(stakingContract.address))).to.equal(String(0));
      await rewardsToken.mintTokens(mintAmount, stakingContract.address);
      expect(String(await rewardsToken.balanceOf(stakingContract.address))).to.equal(String(mintAmount));
    });

    it("Should throw DivisionByZero error if duration is not set while trying to notify added rewards", async function () {
      expect(String(await stakingContract.duration())).to.equal(String(0));
      try{
        await stakingContract.notifyRewardAmount(ethers.utils.parseEther('1000'))
      }
      catch(ex){
        expect(String(ex)).to.contain("Division or modulo division by zero");
      }
    });

    it("Should not let notify rewards if balance is lower than the amount", async function () {
      await stakingContract.setRewardsDuration(300);
      expect(Number(await rewardsToken.balanceOf(stakingContract.address))).to.equal(0);
      try{
        await stakingContract.notifyRewardAmount(ethers.utils.parseEther('1'));
      }
      catch (ex){
        expect(String(ex)).to.contain("Reward amount cannot be greater than balance!");
      }
    });

    it("Should update all the staking parameters when calling notify rewards after sending funds to the contract", async function () {
      await stakingContract.setRewardsDuration(300);
      const mintAmount = ethers.utils.parseEther('1000');
      await rewardsToken.mintTokens(mintAmount, stakingContract.address);
      expect(Number(await stakingContract.finishAt())).to.equal(0);
      expect(Number(await stakingContract.updatedAt())).to.equal(0);
      expect(Number(await stakingContract.rewardRate())).to.equal(0);
      await stakingContract.notifyRewardAmount(mintAmount);
      expect(Number(await stakingContract.finishAt())).not.to.equal(0);
      expect(Number(await stakingContract.updatedAt())).not.to.equal(0);
      expect(Number(await stakingContract.rewardRate())).not.to.equal(0);
    });
  });

  context("Staking", function () {
    let mintAmount: any;
    beforeEach(async function () {
      await stakingContract.setRewardsDuration(300);
      mintAmount = ethers.utils.parseEther('1000');
      await rewardsToken.mintTokens(mintAmount, stakingContract.address);
      await stakingContract.notifyRewardAmount(mintAmount);
    });


    it("Should not let stake tokens if Staking Contract has no allowance on the user's tokens", async function () {
      try{
        await stakingContract.connect(beneficiary).stake(1);
      }
      catch(ex){
        expect(String(ex)).to.contain("ERC20: insufficient allowance");
      }
    });

    it("Should not let stake tokens if the user has not enough tokens", async function () {
      try{
        await stakingToken.connect(beneficiary).approve(stakingContract.address, mintAmount);
        await stakingContract.connect(beneficiary).stake(1);
      }
      catch(ex){
        expect(String(ex)).to.contain("ERC20: transfer amount exceeds balance");
      }
    });

    it("Staking tokens should update balance of user and total supply", async function () {
        expect(Number(await stakingContract.balanceOf(beneficiary.address))).to.equal(0);
        expect(Number(await stakingContract.totalSupply())).to.equal(0);
        expect(Number(await stakingContract.rewardPerToken())).to.equal(0);
        await stakingToken.connect(beneficiary).approve(stakingContract.address, mintAmount);
        await stakingToken.mintTokens(mintAmount, beneficiary.address);
        await stakingContract.connect(beneficiary).stake(mintAmount);
        await timeUtil.moveBlocks(1);
        expect(Number(await stakingContract.balanceOf(beneficiary.address))).to.equal(Number(mintAmount));
        expect(Number(await stakingContract.totalSupply())).to.equal(Number(mintAmount));
        expect(Number(await stakingContract.rewardPerToken())).to.be.greaterThan(0);
        expect(Number(await stakingContract.earned(beneficiary.address))).to.be.greaterThan(0);
    });

    it("Staking user should earn rewards tokens after some time", async function () {
      await stakingToken.connect(beneficiary).approve(stakingContract.address, mintAmount);
      await stakingToken.mintTokens(mintAmount, beneficiary.address);
      await stakingContract.connect(beneficiary).stake(mintAmount);
      expect(Number(await stakingContract.earned(beneficiary.address))).to.equal(0);
      await timeUtil.moveBlocks(1);
      expect(Number(await stakingContract.earned(beneficiary.address))).to.be.greaterThan(0);
  });
  });

  context("Claiming rewards", function () {
    let mintAmount: any;
    beforeEach(async function () {
      await stakingContract.setRewardsDuration(300);
      mintAmount = ethers.utils.parseEther('1000');
      await rewardsToken.mintTokens(mintAmount, stakingContract.address);
      await stakingContract.notifyRewardAmount(mintAmount);
      await stakingToken.connect(beneficiary).approve(stakingContract.address, mintAmount);
      await stakingToken.mintTokens(mintAmount, beneficiary.address);
      
    });

    it("Calling claimRewards should transfer a rewards token amount if the user has pending rewards", async function () {
      await stakingContract.connect(beneficiary).stake(mintAmount);
      expect(Number(await rewardsToken.balanceOf(beneficiary.address))).to.equal(0);
      await timeUtil.moveBlocks(1);
      expect(Number(await stakingContract.earned(beneficiary.address))).to.be.greaterThan(0);
      await stakingContract.connect(beneficiary).claimRewards();
      expect(Number(await rewardsToken.balanceOf(beneficiary.address))).to.be.greaterThan(0);
      expect(Number(await stakingContract.earned(beneficiary.address))).to.equal(0);
    });

  });


  
});
