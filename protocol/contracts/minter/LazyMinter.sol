pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../library/LibSafeMath.sol";
import "../ERC1155Mintable.sol";
import "../mixin/MixinOwnable.sol";
import "../mixin/MixinPausable.sol";
import "../mixin/MixinSignature.sol";
import "../mixin/MixinReentrancy.sol";
import "../MetadataRegistry.sol";

contract LazyMinter is Ownable, MixinPausable, MixinSignature, MixinReentrancy {
  using LibSafeMath for uint256;

  uint256 public tokenType;

  ERC1155Mintable public mintableErc1155;
  MetadataRegistry public registry;

  address payable public treasury;
  address public verifier;

  struct SignedMint {
    address dst;
    string uri;
    uint256 ethPriceInWei;
    uint256 salt;
    bytes signature;
  }

  constructor(
    address _registry,
    address _mintableErc1155,
    address _verifier,
    address payable _treasury,
    uint256 _tokenType
  ) {
    registry = MetadataRegistry(_registry);
    mintableErc1155 = ERC1155Mintable(_mintableErc1155);
    treasury = _treasury;
    tokenType = _tokenType;
    verifier = _verifier;
  }

  function pause() external onlyOwner() {
    _pause();
  } 

  function unpause() external onlyOwner() {
    _unpause();
  }  

  function setTreasury(address payable _treasury) external onlyOwner() {
    treasury = _treasury;
  }

  function setVerifier(address _verifier) external onlyOwner() {
    verifier = _verifier;
  }

  function getSignedMintHash(SignedMint memory signedMint) public pure returns(bytes32) {
      return keccak256(abi.encodePacked(signedMint.dst, signedMint.uri, signedMint.ethPriceInWei, signedMint.salt)) ;
  }

  function verifySignedMint(address signer, SignedMint memory signedMint) public pure returns(bool) {
    bytes32 signedHash = getSignedMintHash(signedMint);
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(signedMint.signature);
    return isSigned(signer, signedHash, v, r, s);
  }

  function maxIndex() public view returns (uint256) {
    return mintableErc1155.maxIndex(tokenType);
  }

  function mint(SignedMint[] memory signedMints) public payable whenNotPaused() nonReentrant() {
    // verify signatures
    for (uint256 i = 0; i < signedMints.length; ++i) {
      require(signedMints[i].dst == msg.sender, "mints not sent by dst");
      require(verifySignedMint(verifier, signedMints[i]) == true, 'invalid signature');
    }
    // calculate and transfer
    uint256 price = 0;
    for (uint256 i = 0; i < signedMints.length; ++i) {
      price += signedMints[1].ethPriceInWei;
    }
    require(price <= msg.value, "insufficient funds to pay for mint");
    treasury.call{value: price}("");

    //mint tokens
    address[] memory dsts = new address[](signedMints.length);
    string[] memory uris = new string[](signedMints.length);
    for (uint256 i = 0; i < signedMints.length; ++i) {
      dsts[i] = signedMints[i].dst;
      uris[i] = signedMints[i].uri;
    }
    _mint(dsts, uris);
  }

  function _mint(address[] memory dsts, string[] memory uris) internal {
    uint256[] memory tokenIds = new uint256[](dsts.length);
    for (uint256 i = 0; i < dsts.length; ++i) {
      uint256 index = maxIndex() + 1 + i;
      uint256 tokenId  = tokenType | index;
      string[] memory key = new string[](1);
      key[0] = mintableErc1155.metadataKey();
      string[] memory text = new string[](1);
      text[0] = uris[i];
      registry.writeDocuments(tokenId, key, text);
      tokenIds[i] = tokenId;
    }
    mintableErc1155.mintNonFungible(tokenType, dsts);
  }
}