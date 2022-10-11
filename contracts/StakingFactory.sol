// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Staking.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./token/ERC20.sol";

contract StakingFactory is Ownable{

    event StakingContractCreated(address contractAddress, address stakingToken, address rewardsToken);

    constructor () {}

    function deployStakingContractAndTokens(string memory _rewardsTokenName, string memory _rewardsTokenSymbol, string memory _stakingTokenName, string memory _stakingTokenSymbol) external onlyOwner {
        //Staking token deployment
        CustomToken stakingToken = new CustomToken(_stakingTokenName, _stakingTokenSymbol);
        stakingToken.transferOwnership(msg.sender);

        //Rewards token deployment
        CustomToken rewardsToken = new CustomToken(_rewardsTokenName, _rewardsTokenSymbol);
        rewardsToken.transferOwnership(msg.sender);

        //Staking contract deployment
        Staking stakingContract = new Staking(address(stakingToken), address(rewardsToken));
        stakingContract.transferOwnership(msg.sender);

        emit StakingContractCreated(address(stakingContract), address(stakingToken), address(rewardsToken));
    }

    function deployStakingContract(address _stakingToken, address _rewardsToken) external onlyOwner{
        require(_stakingToken != address(0), "Staking token cannot be the zero address!");
        require(_rewardsToken != address(0), "Rewards token cannot be the zero address!");
        Staking stakingContract = new Staking(_stakingToken, _rewardsToken);
        stakingContract.transferOwnership(msg.sender);
        emit StakingContractCreated(address(stakingContract), _stakingToken, _rewardsToken);
    }
}