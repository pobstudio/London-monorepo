// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LondonGift.sol";
import "./ERC20Mintable.sol";
import "./Erc721.sol";
import "./Ownable.sol";
import "./utils/Strings.sol";

contract LondonLoot is Ownable, ERC721 {
    using Strings for uint256;

    bytes32 public immutable provenance;

    LondonGift public londonGift;

    string public baseMetadataURI;
    string public contractURI;

    mapping(uint256 => bool) public londonGiftToMintedState;

    constructor (
      string memory name_,
      string memory symbol_,
      address londonGift_,
      bytes32 provenance_
    ) ERC721(name_, symbol_) {
      londonGift = LondonGift(londonGift_);
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

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();
        
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }
    
    function mint(uint256[] memory tokenIds) public {
      for (uint i = 0; i < tokenIds.length; ++i) {
        require(londonGift.ownerOf(tokenIds[i]) == _msgSender(), 'Do not own $LONDON GIFT');
        require(!londonGiftToMintedState[tokenIds[i]], 'Already minted');
        _safeMint(_msgSender(), tokenIds[i]);
      }
    }
}