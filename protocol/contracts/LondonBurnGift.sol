// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnGift is LondonBurnBase {
  uint256 constant MIN_GIFT_AMOUNT_PER_BURN =    2;
  uint256 constant MAX_GIFT_AMOUNT_PER_BURN =    15;
  uint256 constant MAX_TOTAL_GIFT_BURN_AMOUNT =    1559;

  uint256 totalGiftBurnAmount;
  uint256 numGiftBurns;

  constructor(
  ) {
  }

  uint256 public giftRevealBlockNumber = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  function setGiftRevealBlockNumber(uint256 _giftRevealBlockNumber) external onlyOwner {
      giftRevealBlockNumber = _giftRevealBlockNumber;
  }

  function numBurnFromGiftAmount(uint256 amount) public pure returns (uint256) {
    return (amount * 2) - 1;
  }

  // NOTE: function replicates the values for ((2n - 1) / n) ^ 3
  function londonNeededFromGiftAmount(uint256 amount) public view returns (uint256) {
    if (block.number < ultraSonicForkBlockNumber) {
      return 1559 ether;
    }
    if (amount == 2) {
      return 3375 ether;
    }
    if (amount == 3) {
      return 4629 ether;
    }
    if (amount == 4) {
      return 5359 ether;
    }
    if (amount == 5) {
      return 5832 ether;
    }
    if (amount == 6) {
      return 6162 ether;
    }
    if (amount == 7) {
      return 6405 ether;
    }
    if (amount == 8) {
      return 6591 ether;
    }
    if (amount == 9) {
      return 6739 ether;
    }
    if (amount == 10) {
      return 6859 ether;
    }
    if (amount == 11) {
      return 6958 ether;
    }
    if (amount == 12) {
      return 7041 ether;
    }
    if (amount == 13) {
      return 7111 ether;
    }
    if (amount == 14) {
      return 7173 ether;
    }
    if (amount == 15) {
      return 7226 ether;
    }
    return 0;
  }

  function mintGiftType(
    address to,
    uint256[] calldata giftTokenIds
  ) public {
    require(block.number > giftRevealBlockNumber, 'GIFT has not been revealed yet');
    require(totalGiftBurnAmount + giftTokenIds.length <= MAX_TOTAL_GIFT_BURN_AMOUNT, "Max GIFT burnt");
    require(giftTokenIds.length >= MIN_GIFT_AMOUNT_PER_BURN && giftTokenIds.length <= MAX_GIFT_AMOUNT_PER_BURN , "Exceeded gift burn range");

    _payLondon(to, londonNeededFromGiftAmount(giftTokenIds.length));
    
    // burn gifts
    for (uint i = 0; i < giftTokenIds.length; ++i) {
      externalBurnableERC721.safeTransferFrom(to, address(0), giftTokenIds[i]);
    }
    if (block.number < ultraSonicForkBlockNumber) {
      _mintTokenType(to, GIFT_TYPE, numBurnFromGiftAmount(giftTokenIds.length));
      totalGiftBurnAmount += giftTokenIds.length;
    } else {
      _mintTokenType(to, ULTRA_SONIC_TYPE, 1);
      totalGiftBurnAmount += 1;
    }
    numGiftBurns++;
  }
}