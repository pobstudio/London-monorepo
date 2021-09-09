// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./Ownable.sol";
import "./utils/Strings.sol";

contract ERC721Mintable is Ownable, ERC721 {
    using Strings for uint256;

    uint256 public maxIndex = 0;

    constructor (
      string memory name_,
      string memory symbol_
    ) ERC721(name_, symbol_) {
    }
    
    function mint() public {
        _safeMint(_msgSender(), maxIndex);
        maxIndex++;
    }
}