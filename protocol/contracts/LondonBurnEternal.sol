// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";

abstract contract LondonBurnEternal is LondonBurnBase {
  uint256 constant ETERNAL_MINTABLE_SUPPLY = 100;

  constructor(
  ) {
  }
 
  function mintEternalType(
    MintCheck[] calldata mintChecks 
  ) public {
    require(msg.sender == treasury, "Only treasury can mint");
    require(block.number > revealBlockNumber, 'ETERNAL has not been revealed yet');
    require(block.number < ultraSonicForkBlockNumber, "ULTRASONIC MODE ENGAGED");
    require(tokenTypeSupply[ETERNAL_TYPE] + mintChecks.length <= ETERNAL_MINTABLE_SUPPLY, "Exceeded ETERNAL mint amount");
    _mintTokenType(ETERNAL_TYPE, mintChecks);
  }
}