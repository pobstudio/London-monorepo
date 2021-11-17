// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./ERC721.sol";
import "./Ownable.sol";
import "./utils/Strings.sol";
import "./utils/Signature.sol";

contract LondonBurnBase is Ownable, ERC721, Signature {
    using Strings for uint256;

    // $LONDON
    ERC20 public immutable payableErc20;

    // LONDON GIFT
    ERC721 public immutable externalBurnableERC721;

    // addresses
    address public treasury;
    address public mintingAuthority;

    mapping(uint256 => string)  tokenIdToURI;
    mapping(bytes32 => uint256) mintCheckHashToTokenId;
    mapping(uint256 => uint256) public tokenTypeSupply;

    struct MintCheck {
      address to;
      string URI;
      bytes signature;
    }

    string public contractURI;

    // token types
    uint256 constant NOBLE_TYPE =    0x8000000000000000000000000000000100000000000000000000000000000000;
    uint256 constant GIFT_TYPE =     0x8000000000000000000000000000000200000000000000000000000000000000;
    uint256 constant PRISTINE_TYPE = 0x8000000000000000000000000000000300000000000000000000000000000000;
    uint256 constant ETERNAL_TYPE =  0x8000000000000000000000000000000400000000000000000000000000000000;
    uint256 constant ASHEN_TYPE =    0x8000000000000000000000000000000500000000000000000000000000000000;
    uint256 constant ULTRA_SONIC_TYPE =   0x8000000000000000000000000000000600000000000000000000000000000000;

    // block numbers
    uint256 public ultraSonicForkBlockNumber = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    uint256 public revealBlockNumber = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    // events
    event MintCheckUsed(uint256 indexed tokenId, bytes32 indexed mintCheck);

    constructor (
      string memory name_,
      string memory symbol_,
      address _payableErc20,
      address _externalBurnableERC721
    ) ERC721(name_, symbol_) {
      payableErc20 = ERC20(_payableErc20);
      externalBurnableERC721 = ERC721(_externalBurnableERC721);
    }

    function setTreasury(address _treasury) public onlyOwner {
      treasury = _treasury;
    }

    function setMintingAuthority(address _mintingAuthority) public onlyOwner {
      mintingAuthority = _mintingAuthority;
    }

    function setContractURI(string calldata newContractURI) external onlyOwner {
        contractURI = newContractURI;
    }

    function setUltraSonicForkBlockNumber(uint256 _ultraSonicForkBlockNumber) external onlyOwner {
        ultraSonicForkBlockNumber = _ultraSonicForkBlockNumber;
    }

    function setRevealBlockNumber(uint256 _revealBlockNumber) external onlyOwner {
        revealBlockNumber = _revealBlockNumber;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        require(bytes(tokenIdToURI[tokenId]).length > 0, "ERC721Metadata: URI query for nonexistent token URI");

        return tokenIdToURI[tokenId];
    }

    function getMintCheckHash(MintCheck calldata _mintCheck) public pure returns (bytes32) {
      return keccak256(abi.encodePacked(_mintCheck.to, _mintCheck.URI));
    }

    function verifyMintCheck(
      MintCheck calldata _mintCheck
    ) public view returns (bool) {
      bytes32 signedHash = getMintCheckHash(_mintCheck);
      (bytes32 r, bytes32 s, uint8 v) = splitSignature(_mintCheck.signature);
      return isSigned(mintingAuthority, signedHash, v, r, s);
    }

    function _mintTokenType(uint256 tokenType, MintCheck[] calldata _mintChecks) public {
      for (uint i = 0; i < _mintChecks.length; ++i) {
        bytes32 mintCheckHash = getMintCheckHash(_mintChecks[i]);
        require(mintCheckHashToTokenId[mintCheckHash] == 0, "Mint check has already been used");
        require(verifyMintCheck(_mintChecks[i]), "Mint check is not valid");
        uint tokenId = (tokenType | ++tokenTypeSupply[tokenType]);
        _mint(_mintChecks[i].to, tokenId);
        tokenIdToURI[tokenId] = _mintChecks[i].URI;
        mintCheckHashToTokenId[mintCheckHash] = tokenId;
        emit MintCheckUsed(tokenId, mintCheckHash);
      }
    }
}