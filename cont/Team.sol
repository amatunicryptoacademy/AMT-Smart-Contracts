// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Team is Ownable {
    using SafeERC20 for IERC20;
    uint256 public constant BLOCKS_PER_MONTH = 861000;
    uint256 public lockedPeriod = 36 * BLOCKS_PER_MONTH;
    uint256 public lockedAmount = 18000000 ether;
    uint256 public claimedAmount;
    uint256 public startBlock;
    uint256 public unlockedPerMonth = 1000000 ether;
    IERC20 public token;

    // event
    event Claimed(uint256 amount, uint256 blockNumber);

    constructor(IERC20 token_) {
        require(address(token_) != address(0), "Team: Token address can't be address zero");
        token = token_;
        startBlock = block.number;
    }

    function claim(uint256 amount_) external onlyOwner {
        require(block.number >= startBlock + 37 * BLOCKS_PER_MONTH, "Team: Locked period didn't passed");
        uint256 unlockedAmount = getUnlockedTokenAmount();
        require(amount_ <= unlockedAmount, "Team: Insufficiant unlocked tokens");
        claimedAmount += amount_;
        token.safeTransfer(msg.sender, amount_);
        emit Claimed(amount_, block.number);
    }

    function getUnlockedTokenAmount() public view returns (uint256 amount) {
        if(block.number < startBlock + 37 * BLOCKS_PER_MONTH){
            return 0;
        }
        amount = unlockedPerMonth * ((block.number - (startBlock + 36 * BLOCKS_PER_MONTH)) / BLOCKS_PER_MONTH);
        if(amount >= lockedAmount){
            amount = lockedAmount;
        }
        amount-= claimedAmount;
        return amount;
    }
}
