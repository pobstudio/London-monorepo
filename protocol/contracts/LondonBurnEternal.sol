// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnEternal is LondonBurnBase {
  uint256 constant ETERNAL_MINTABLE_SUPPLY =    100;

  constructor(
  ) {
  }
 
  function mintPristineType(
    address to,
    uint256 numMints
  ) public {
    require(msg.sender == treasury, "Only treasury can mint");
    require(block.number < ultraSonicForkBlockNumber, "ULTRASONIC MODE ENGAGED");
    require(tokenTypeSupply[PRISTINE_TYPE] + numMints <= ETERNAL_MINTABLE_SUPPLY, "Exceeded per tx mint amount");
    _mintTokenType(to, ETERNAL_TYPE, numMints);
  }
}