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

  function numBurnFromGiftAmount(uint256 amount) public pure returns (uint256) {
    return (amount * 2) - 1;
  }

  // TODO: This is computationally heavy, and may result in rounding errors, maybe worth hardcoding these values
  function londonNeededFromGiftAmount(uint256 amount) public pure returns (uint256) {
    // return (((amount * 2) - 1) / amount) ^ 2 - (((amount * 2) - 1) / amount) + (amount - 1) ^ (3/8) - 0.75;
    return 1559;
  }

  function mintGiftType(
    address to,
    uint256[] calldata giftTokenIds
  ) public {
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