// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnMinterBase.sol";
import "./LondonBurn.sol";

abstract contract LondonBurnEternal is LondonBurnMinterBase {
  uint256 constant ETERNAL_MINTABLE_SUPPLY = 100;

  constructor(
  ) {
  }
 
  function mintEternalType(
    LondonBurn.MintCheck[] calldata _mintChecks
  ) public {
    require(msg.sender == treasury, "Only treasury can mint");
    require(block.number > revealBlockNumber, 'ETERNAL has not been revealed yet');
    require(block.number < ultraSonicForkBlockNumber, "ULTRASONIC MODE ENGAGED");
    require(londonBurn.tokenTypeSupply(ETERNAL_TYPE) + _mintChecks.length <= ETERNAL_MINTABLE_SUPPLY, "Exceeded ETERNAL mint amount");
    londonBurn.mintTokenType(ETERNAL_TYPE, _mintChecks);
  }
}