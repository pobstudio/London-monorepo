// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnMinterBase.sol";
import "./LondonBurn.sol";

abstract contract LondonBurnPristine is LondonBurnMinterBase {
  uint256 constant MAX_PRISTINE_AMOUNT_PER_MINT =    4;
  uint256 constant PRISTINE_MINTABLE_SUPPLY =    500;
  uint256 constant PRICE_PER_PRISTINE_MINT =    1559 ether; // since $LONDON is 10^18 we can use ether as a unit of accounting
  address lastMinter;

  constructor(
  ) {
  }
 
  function mintPristineType(
    LondonBurn.MintCheck[] calldata mintChecks 
  ) payable public {
    require(block.number > revealBlockNumber, 'PRISTINE has not been revealed yet');
    require(block.number < ultraSonicForkBlockNumber, "ULTRASONIC MODE ENGAGED");
    require(mintChecks.length <= MAX_PRISTINE_AMOUNT_PER_MINT, "Exceeded per tx mint amount");
    require(lastMinter != tx.origin, "Can't mint consecutively");
    require(londonBurn.tokenTypeSupply(PRISTINE_TYPE) + mintChecks.length <= PRISTINE_MINTABLE_SUPPLY, "Exceeded PRISTINE mint amount");
    _payLondon(_msgSender(), mintChecks.length * PRICE_PER_PRISTINE_MINT);
    londonBurn.mintTokenType(PRISTINE_TYPE, mintChecks);
    lastMinter = tx.origin;
  }
}