// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Mintable.sol";
import "./ERC721.sol";
import "./LondonBurnBase.sol";
import "./utils/Base64.sol";
import "./utils/Strings.sol";

library LondonBurnMetadataFactory {
  uint256 constant DECIMALS_TO_CALCULATE_SVG = 4;
  uint256 constant UNIT_DECIMAL = 10000;

  using Strings for uint256;

  function convertUintToFloatString(uint256 value) public pure returns (string memory floatStr) {
    if (value == 0) {
      floatStr = "0.0";
    }
    uint256 length;
    uint256 temp = value;
    while (temp != 0)
    {
      length++;
      temp /= 10;
    }
    if (length <= DECIMALS_TO_CALCULATE_SVG) {
      length = DECIMALS_TO_CALCULATE_SVG + 1;
    }
    bytes memory buffer = new bytes(length + 1);
    for (uint i = length + 1; i > 0; i--) {
      uint c_i = i - 1;
      if (c_i == (length - DECIMALS_TO_CALCULATE_SVG)) {
        buffer[c_i] = bytes1(uint8(46));
      } else {
        if (value == 0) {
          buffer[c_i] = bytes1(uint8(48));
        } else {
          buffer[c_i] = bytes1(uint8(48 + value % 10));
          value /= 10;
        }
      }
    }
    floatStr = string(buffer);
  }

  function getLinePath(string memory d, uint color) public pure returns (string memory svg) {
    return string(
      abi.encodePacked(
        '<path d="', d, '" stroke-width="12" opacity="0.75" stroke="', color.toHexStringWithColorPrefix(3), '" stroke-linecap="round" />'
      )
    );
  }

  function getLineD(uint x1, uint y1, uint dx, uint dy) public pure returns (string memory svg) {
    return string(
      abi.encodePacked(
        ' M ', x1.toString(), ' ', y1.toString(),
        ' l ', dx.toString(), ' ', dy.toString()
      )
    );
  }

  // function constructTokenURI(uint256 tokenId) public returns (string memory) {
  //   string memory name = "TODO";
  //   string memory description = "TODO";
  //   string memory image = Base64.encode(bytes(generateSVGImage(tokenId)));
  //   return
  //           string(
  //               abi.encodePacked(
  //                   'data:application/json;base64,',
  //                   Base64.encode(
  //                       bytes(
  //                           abi.encodePacked(
  //                               '{"name":"',
  //                               name,
  //                               '", "description":"',
  //                               description,
  //                               '", "image": "',
  //                               'data:image/svg+xml;base64,',
  //                               image,
  //                               '"}'
  //                           )
  //                       )
  //                   )
  //               )
  //           );
  // }

  function getRandomValue(uint min, uint max, bytes memory seed) public pure returns (uint) {
    uint random = uint(keccak256(abi.encodePacked(seed)));
    return min + random % (max - min);
  }

  function getCoinFlip(bytes memory seed) public pure returns (bool) {
    return getRandomValue(0, 2, seed) == 0;
  }

  function generateBackground(bytes32 seed, uint gridSize, uint bounds, uint margin, uint backgroundColor) public pure returns (string memory path) {
    // simple background
    bool isEnd = false;
    uint x = margin;
    uint y = margin;
    string memory d = "";
    uint localRandomTape = uint(seed);
    uint ct = 0;
    while(!isEnd) {
      // can optimize to use another random source
      uint rand = (localRandomTape % 0xF) / 2;
      localRandomTape >>= 4;

      uint length = (rand * gridSize);
      if (x + length > bounds + margin) {
        length = bounds + margin - x; 
      }
      d = string(
        abi.encodePacked(
          d,
          getLineD(x, y, length, 0)
        )
      );
      x += (length + gridSize);
      if (x > margin + bounds) {
        if (y >= margin + bounds) {
          isEnd = true;
        }
        x = margin;
        y += gridSize;
      }
      ct ++;
      if (localRandomTape == 0x0) {
        localRandomTape = uint(keccak256(abi.encodePacked(seed, ct)));
      }
    }
    path = getLinePath(d, backgroundColor);
  }

  function generateLayer(bytes32 seed, uint gridSize, uint bounds, uint margin, uint chance, uint color) public pure returns (string memory path) {
    string memory d = "";
    uint localRandomTape = uint(seed);
    uint ct = 0;
    uint bplusM = bounds + margin;
    for (uint x = margin; x < bplusM; x += gridSize) {
      for (uint y = margin; y < bplusM; y += gridSize) {
        uint occur = (localRandomTape % 0xF);
        localRandomTape >>= 4;
        if (occur < chance) {
          uint rand = localRandomTape % 0xF;
          localRandomTape >>= 4;
          uint s = (localRandomTape % 0xF) / 2;
          localRandomTape >>= 4;
          uint delta = s * gridSize;
          if (rand >= 0 && rand < 4) {
             d = string(
              abi.encodePacked(
                d,
                getLineD(x, y, 0, 0) 
              )
            ); 
          }
          if (rand >= 4 && rand < 8) {
            uint dx = x + delta > bplusM ? bplusM - x : delta;
            d = string(
              abi.encodePacked(
                d,
                getLineD(x, y, dx, 0) 
              )
            ); 
          }
          if (rand >= 8 && rand < 12) {
            uint dy = y + delta > bplusM ? bplusM - y : delta;
            d = string(
              abi.encodePacked(
                d,
                getLineD(x, y, 0, dy) 
              )
            ); 
          }
          if (rand >= 12 && rand < 16) {
            uint dy = delta;
            uint dx = delta;
            if (x + dx > bplusM) {
              dx = bplusM - x;
              dy = dx;
            }
            if (y + dy > bplusM) {
              dy = bplusM - y;
              dx = dy;
            }
            d = string(
              abi.encodePacked(
                d,
                getLineD(x, y, dx, dy) 
              )
            ); 
          }
        }
      }
      ct++;
      if (localRandomTape == 0x0) {
        localRandomTape = uint(keccak256(abi.encodePacked(seed, ct)));
      }
    }
    path = getLinePath(d, color);
  }

  function generateSVGImage(uint256 tokenId) public pure returns (string memory svg) {
    // init variables
    // TODO should these values be tuned
    bytes32 seed = keccak256(abi.encode(tokenId));
    uint margin = 40;
    uint bounds = 520;
    
    uint gridSize = 40;
    
    uint[] memory pallete = new uint[](4);
    // TODO: COLOR
    pallete[0] = 0xCEE5D0;
    pallete[1] = 0xF3F0D7;
    pallete[2] = 0xFED2AA;
    pallete[3] = 0xFF0000;

    string memory paths = "";

    paths = string(
      abi.encodePacked(
        paths,
        generateBackground(seed, gridSize, bounds, margin, pallete[3])
      )
    );

    // layers
    uint chance = 4;
    for (uint i = 0; i < pallete.length - 1; ++i) {
      paths = string(
        abi.encodePacked(
          paths,
          generateLayer(seed, gridSize, bounds, margin, chance, pallete[i])
        )
      );
      if (chance > 2) {
        chance -= 1;
      }
    }
    svg = 
      string(
          abi.encodePacked(
              '<svg width="600" height="600" viewBox="0 0 600 600">',
              '<rect opacity="0.5" fill="', pallete[3].toHexStringWithColorPrefix(3) ,'" x="0" y="0" width="100%" height="100%"/>',
              paths,
              '</svg>'
          )
      );
  }
}

abstract contract LondonBurnMetadata is LondonBurnBase {

  constructor(
  ) {
  }

}