// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnAshen is LondonBurnBase {
  uint256 constant MIN_SELF_AMOUNT_PER_BURN =    3;
  uint256 constant MAX_SELF_AMOUNT_PER_BURN =    7;

  constructor(
  ) {
  }

  function numBurnFromSelfAmount(uint256 amount) public pure returns (uint256) {
    return amount - 1;
  }

  function londonNeededFromSelfAmount(uint256 amount) public view returns (uint256) {
    if (block.number >= ultraSonicForkBlockNumber) {
      return 1559 ether;
    } else {
      return 1559 ether * amount;
    }
  }

  function mintAshenType(
    uint256[] calldata tokenIds,
    MintCheck[] calldata _mintChecks
  ) public {
    require(block.number > revealBlockNumber, 'ASHEN has not been revealed yet');
    require(tokenIds.length >= MIN_SELF_AMOUNT_PER_BURN && tokenIds.length <= MAX_SELF_AMOUNT_PER_BURN , "Exceeded self burn range");
    payableErc20.transferFrom(_msgSender(), treasury, londonNeededFromSelfAmount(tokenIds.length));
    // burn gifts
    for (uint i = 0; i < tokenIds.length; ++i) {
      _safeTransfer(_msgSender(), address(0xdead), tokenIds[i], ""); // is it safe to use internal function here?
    }
    require(_mintChecks.length == numBurnFromSelfAmount(tokenIds.length), "MintChecks required mismatch");
    _mintTokenType(block.number < ultraSonicForkBlockNumber ? ASHEN_TYPE : ULTRA_SONIC_TYPE, _mintChecks);
  }
}