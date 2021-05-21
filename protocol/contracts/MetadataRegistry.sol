pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./library/LibSafeMath.sol";
import "./ERC1155Mintable.sol";
import "./mixin/MixinOwnable.sol";
import "./mixin/MixinSignature.sol";

contract MetadataRegistry is Ownable {
  using LibSafeMath for uint256;

  ERC1155Mintable public mintableErc1155;

  mapping(uint256 => mapping(string => Document)) public tokenIdToDocumentMap;
  mapping(address => bool) public permissedWriters;
  
	struct Document {
    address writer;
		string text;
		uint creationTime;
	}

  constructor(
    address _mintableErc1155
  ) {
    mintableErc1155 = ERC1155Mintable(_mintableErc1155);
    permissedWriters[msg.sender] = true;
  }

  event UpdatedDocument(
      uint256 indexed tokenId,
      address indexed writer,
      string indexed key,
      string text,
      uint256 salt,
      bytes signature
  );

  modifier onlyIfPermissed(address writer) {
    require(permissedWriters[writer] == true, "writer can't write to registry");
    _;
  }

  function updatePermissedWriterStatus(address _writer, bool status) public onlyOwner() {
    permissedWriters[_writer] = status;
  }

  function writeDocuments(uint256 tokenId, string[] memory keys, string[] memory texts) public onlyIfPermissed(msg.sender) {
    require(keys.length == texts.length, "tokenIds and txHashes size mismatch");
    for (uint256 i = 0; i < keys.length; ++i) {
      string memory key = keys[i];
      string memory text = texts[i];
      tokenIdToDocumentMap[tokenId][key] = Document(msg.sender, text, block.timestamp);
      emit UpdatedDocument(tokenId, msg.sender, key, text, 0, ""); 
    }
  }
}