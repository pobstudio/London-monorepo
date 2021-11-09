// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnAshen is LondonBurnBase {
  uint256 constant MIN_SELF_AMOUNT_PER_BURN =    3;
  uint256 constant MAX_SELF_AMOUNT_PER_BURN =    7;

  uint256 totalSelfBurnAmount;
  uint256 numSelfBurns;

  uint256 public ashenRevealBlockNumber = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
  
  constructor(
  ) {
  }

  function setAshenRevealBlockNumber(uint256 _ashenRevealBlockNumber) external onlyOwner {
      ashenRevealBlockNumber = _ashenRevealBlockNumber;
  }

  function numBurnFromSelfAmount(uint256 amount) public pure returns (uint256) {
    return amount - 1;
  }

  function londonNeededFromSelfAmount(uint256 amount) public view returns (uint256) {
    if (block.number < ultraSonicForkBlockNumber) {
      return 1559 ether;
    } else {
      return 1559 ether * amount;
    }
  }

  function mintAshenType(
    address to,
    uint256[] calldata tokenIds
  ) public {
    require(block.number > ashenRevealBlockNumber, 'ASHEN has not been revealed yet');
    require(tokenIds.length >= MIN_SELF_AMOUNT_PER_BURN && tokenIds.length <= MAX_SELF_AMOUNT_PER_BURN , "Exceeded self burn range");
    _payLondon(to, londonNeededFromSelfAmount(tokenIds.length));
    // burn gifts
    for (uint i = 0; i < tokenIds.length; ++i) {
      _safeTransfer(to, address(0), tokenIds[i], ""); // is it safe to use internal function here?
    }
    _mintTokenType(to, ASHEN_TYPE, numBurnFromSelfAmount(tokenIds.length));
    totalSelfBurnAmount += tokenIds.length;
    if (block.number < ultraSonicForkBlockNumber) {
      _mintTokenType(to, ASHEN_TYPE, numBurnFromSelfAmount(tokenIds.length));
    } else {
      _mintTokenType(to, ULTRA_SONIC_TYPE, numBurnFromSelfAmount(tokenIds.length)); 
    }
    totalSelfBurnAmount += tokenIds.length;
    numSelfBurns++;
  }
}