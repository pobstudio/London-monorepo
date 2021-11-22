// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./ERC721.sol";
import "./Ownable.sol";
import "./utils/Strings.sol";
import "./utils/Signature.sol";

contract LondonBurn is Ownable, ERC721, Signature {
    using Strings for uint256;

    address public mintingAuthority;
    address public minter;
    string public contractURI;

    mapping(uint256 => string)  tokenIdToURI;
    mapping(uint256 => uint256) public tokenTypeSupply;

    mapping(bytes32 => uint256) mintCheckHashToTokenId;
    mapping(bytes32 => uint256) modifyCheckHashToTokenId;

    struct MintCheck {
      address to;
      string URI;
      bytes signature;
    }

    struct ModifyCheck {
      uint256 tokenId;
      string URI;
      bytes signature;
    }

    // events
    event MintCheckUsed(uint256 indexed tokenId, bytes32 indexed mintCheck);
    event ModifyCheckUsed(uint256 indexed tokenId, bytes32 indexed modifyCheck);
    
    constructor (
      string memory name_,
      string memory symbol_
    ) ERC721(name_, symbol_) {
    }

    function setContractURI(string calldata newContractURI) external onlyOwner {
        contractURI = newContractURI;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function setMintingAuthority(address _mintingAuthority) external onlyOwner {
      mintingAuthority = _mintingAuthority;
    }

    modifier onlyMinter() {
        require(minter == _msgSender(), "Caller is not the minter");
        _;
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

    function mintTokenType(uint256 tokenType, MintCheck[] calldata _mintChecks) external onlyMinter {
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

    function getModifyCheckHash(ModifyCheck calldata _modifyCheck) public pure returns (bytes32) {
      return keccak256(abi.encodePacked(_modifyCheck.tokenId, _modifyCheck.URI));
    }

    function verifyModifyCheck(
      ModifyCheck calldata _modifyCheck
    ) public view returns (bool) {
      bytes32 signedHash = getModifyCheckHash(_modifyCheck);
      (bytes32 r, bytes32 s, uint8 v) = splitSignature(_modifyCheck.signature);
      return isSigned(mintingAuthority, signedHash, v, r, s);
    }

    function modifyBaseURIByModifyCheck(ModifyCheck[] calldata _modifyChecks) external {
      for (uint i = 0; i < _modifyChecks.length; ++i) {
        bytes32 modifyCheckHash = getModifyCheckHash(_modifyChecks[i]);
        require(modifyCheckHashToTokenId[modifyCheckHash] == 0, "Modify check has already been used");
        require(verifyModifyCheck(_modifyChecks[i]), "Modify check is not valid");
        require(_exists(_modifyChecks[i].tokenId), "Tokenid does not exist");
        tokenIdToURI[_modifyChecks[i].tokenId] = _modifyChecks[i].URI;
        modifyCheckHashToTokenId[modifyCheckHash] = _modifyChecks[i].tokenId;
        emit MintCheckUsed(_modifyChecks[i].tokenId, modifyCheckHash);
      }
    }
}