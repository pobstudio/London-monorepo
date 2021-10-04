// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";
import "./utils/Base64.sol";

abstract contract LondonBurnMetadata is LondonBurnBase {

  constructor(
  ) {
  }

  function constructTokenURI(uint256 tokenId) public pure returns (string memory) {
    string memory name = "TODO";
    string memory description = "TODO";
    string memory image = Base64.encode(bytes(generateSVGImage(tokenId)));
    return
            string(
                abi.encodePacked(
                    'data:application/json;base64,',
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "description":"',
                                description,
                                '", "image": "',
                                'data:image/svg+xml;base64,',
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
  }

  function generatePathPatterns(bytes32 seed) internal pure returns (string memory path) {

  }

  function generateSVGImage(uint256 tokenId) public pure returns (string memory svg) {
    bytes32 seed = keccak256(abi.encode(tokenId));

    return
      string(
          abi.encodePacked(
              '<svg width="600" height="600" viewBox="0 0 600 600">',
              '<rect x="0" y="0" width="100%" height="100%"/>',
              '</svg>'
          )
      );
  }
}