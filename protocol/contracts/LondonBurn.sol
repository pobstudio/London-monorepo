// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnAshen.sol";
import "./LondonBurnGift.sol";
import "./LondonBurnNoble.sol";
import "./LondonBurnPristineAndEternal.sol";
import "./LondonBurnBase.sol";
import "./LondonBurnMetadata.sol";

contract LondonBurn is LondonBurnBase, LondonBurnMetadata, LondonBurnNoble, LondonBurnAshen, LondonBurnGift, LondonBurnPristineAndEternal {
  constructor(
    string memory name_,
    string memory symbol_,
    address _payableErc20,
    address _externalBurnableERC721
  ) LondonBurnBase(name_, symbol_, _payableErc20, _externalBurnableERC721) {
  }
}