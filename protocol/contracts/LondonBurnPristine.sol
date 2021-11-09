// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnPristine is LondonBurnBase {
  uint256 constant MAX_PRISTINE_AMOUNT_PER_MINT =    4;
  uint256 constant PRISTINE_MINTABLE_SUPPLY =    500;
  uint256 constant PRICE_PER_PRISTINE_MINT =    1559 ether; // since $LONDON is 10^18 we can use ether as a unit of accounting
  address lastMinter;

  constructor(
  ) {
  }
 
  function mintEternalType(
    address to,
    uint256 numMints
  ) public {
    require(block.number < ultraSonicForkBlockNumber, "ULTRASONIC MODE ENGAGED");
    require(numMints <= MAX_PRISTINE_AMOUNT_PER_MINT, "Exceeded per tx mint amount");
    require(tokenTypeSupply[PRISTINE_TYPE] + numMints <= PRISTINE_MINTABLE_SUPPLY, "Exceeded per tx mint amount");
    require(lastMinter != tx.origin, "Can't mint consecutively");
    _payLondon(to, numMints * PRICE_PER_PRISTINE_MINT);
    _mintTokenType(to, PRISTINE_TYPE, numMints);
    lastMinter = tx.origin;
  }
}