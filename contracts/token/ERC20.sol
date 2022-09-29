// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {

    constructor(string memory _tokenName, string memory _tokenSymbol ) ERC20(_tokenName, _tokenSymbol) {}

    function mintTokens(uint _amount, address _to) external onlyOwner {
        super._mint(_to,_amount);
    }
}