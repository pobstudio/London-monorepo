// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnPristineAndEternal is LondonBurnBase {
  uint256 constant MIN_PRISTINE_AMOUNT_PER_MINT =    4;
  uint256 constant INITIAL_MINTABLE_SUPPLY =    500;
  uint256 constant PRICE_PER_PRISTINE_MINT =    1559; // TODO put in proper values

  address lastMinter;

  constructor(
  ) {
  }

  // TODO
  function maxMintableSupply() public pure returns (uint256) {
    return INITIAL_MINTABLE_SUPPLY;
  }

  function mintPristineType(
    address to,
    uint256 numMints
  ) public {
    require(block.number < ultraSonicForkBlockNumber, "ULTRASONIC MODE ENGAGED");
    require(numMints <= MIN_PRISTINE_AMOUNT_PER_MINT, "Exceeded per tx mint amount");
    require(tokenTypeSupply[PRISTINE_TYPE] + numMints <= maxMintableSupply(), "Exceeded per tx mint amount");
    require(to != tx.origin, "Can't mint consecutively");

    _payLondon(to, numMints * PRICE_PER_PRISTINE_MINT);
    _mintTokenType(to, PRISTINE_TYPE, numMints);
    lastMinter = tx.origin;
  }

  // TODO IMPLEMENT ETERNAL
}