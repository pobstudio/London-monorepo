// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./Ownable.sol";
import "./utils/Strings.sol";

contract LondonLoot is Ownable, ERC721 {
    using Strings for uint256;

    bytes32 public immutable provenance;

    ERC721 public londonGift;

    string public baseMetadataURI;
    string public contractURI;

    constructor (
      string memory name_,
      string memory symbol_,
      address londonGift_,
      bytes32 provenance_
    ) ERC721(name_, symbol_) {
      londonGift = ERC721(londonGift_);
      provenance = provenance_;
    }

    function setBaseMetadataURI(string memory _baseMetadataURI) public onlyOwner {
      baseMetadataURI = _baseMetadataURI;
    }

    function setContractURI(string calldata newContractURI) external onlyOwner {
        contractURI = newContractURI;
    }

    function _baseURI() override internal view virtual returns (string memory) {
      return baseMetadataURI;
    }

    function mint(uint256[] memory tokenIds) public {
      for (uint i = 0; i < tokenIds.length; ++i) {
        require(londonGift.ownerOf(tokenIds[i]) == _msgSender(), 'Do not own $LONDON GIFT');
        _safeMint(_msgSender(), tokenIds[i]);
      }
    }
}