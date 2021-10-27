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
  uint256 constant SQRT_3 = 17320; // 1.7320
  uint256 constant CUBE_W_H_RATIO = 11507; // 0.8690

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

  function getYFromThirtyAngle(uint256 x) public pure returns (uint) {
    return x * UNIT_DECIMAL / SQRT_3;
  }
  
  function getXFromThirtyAngle(uint256 y) public pure returns (uint) {
    return y * SQRT_3 / UNIT_DECIMAL;
  }

  function getSquareRatio(uint256 w) public pure returns (uint) {
    return w * CUBE_W_H_RATIO / UNIT_DECIMAL;
  }

  function getPathForDownwardIso(uint256 length) public pure returns (string memory path) {
    uint256 dx = length / 2;
    uint256 dy = getYFromThirtyAngle(dx);

    return string(
      abi.encodePacked(
        'l -', convertUintToFloatString(dx), ' ', convertUintToFloatString(dy),
        ' l -', convertUintToFloatString(dx), ' -', convertUintToFloatString(dy)
      )
    );
  }

  function getPathForUpwardIso(uint256 length) public pure returns (string memory path) {
    uint256 dx = length / 2;
    uint256 dy = getYFromThirtyAngle(dx);

    return string(
      abi.encodePacked(
        'l ', convertUintToFloatString(dx), ' -', convertUintToFloatString(dy),
        ' l ', convertUintToFloatString(dx), ' ', convertUintToFloatString(dy) 
      )
    );
  }

  function getPrismD(uint256 x, uint256 y, uint256 w, uint256 h) public pure returns (string memory svg) {
    uint256 dx = w / 2;
    uint256 dy = getYFromThirtyAngle(dx);

    string memory path = string(
      abi.encodePacked(
        "M ", convertUintToFloatString(x), ' ', convertUintToFloatString(y),
        " m 0 ", convertUintToFloatString(dy),
        " ", getPathForUpwardIso(w),
        ' l 0 ', convertUintToFloatString(h - (dy * 2)),
        " ", getPathForDownwardIso(w)
      )
    );
    return path; 
  }

  function getPrismPath(string memory d, string memory fill) public pure returns (string memory svg) {
    return string(
      abi.encodePacked(
        '<path fill="', fill, '" d="', d, '"/>'
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

  function generateSVGImage(uint256 tokenId) public pure returns (string memory svg) {
    // init variables
    // TODO should these values be tuned
    bytes32 seed = keccak256(abi.encode(tokenId));
    uint sizeX = 4790000;
    uint sizeY = 5500000;
    uint posX = 600000;
    uint posY = 250000;
    uint colorIndex = 0;
    
    uint[] memory pallete = new uint[](4);
    // TODO: COLOR
    pallete[0] = 0x49FF00;
    pallete[1] = 0xFBFF00;
    pallete[2] = 0xFF9300;
    pallete[3] = 0xFF0000;

    // go through op codes
    string memory paths = getPrismPath(getPrismD(posX, posY, sizeX, sizeY), 'white');
    sizeX /= 2;
    sizeY /= 2;
    uint tape = uint(seed);
    for (uint i = 0; i < 32; ++i) {
      uint opcode = tape & 0xF;
      tape >>= 4;
      bytes memory localSeed = abi.encodePacked(seed, i);

      // change color Index    
      if (opcode != 0xB) {
        colorIndex = getRandomValue(0, 4, localSeed); 
      } 
      // change size TODO
      // if (opcode == 0x0) {
      //   sizeX *= 2;
      //   sizeY *= 2;
      // }
      if (opcode == 0xE) {
        sizeX /= 2;
        sizeY /= 2;
        // more gradnularity
      }
      // translate 
      if (opcode == 0x1 || opcode == 0x2 || opcode == 0x4) {
        // translate X
        uint scale = getRandomValue(0, 6, localSeed);
        uint delta = (scale * sizeX) / 2;
        bool isNeg = getCoinFlip(abi.encodePacked(localSeed, i));
        if (isNeg && delta <= posX) {
          posX = (posX - delta) % 600;
        } else {
          posX = (posX + delta) % 600;

        }
      }
      if (opcode == 0x7 || opcode == 0x8 || opcode == 0x9) {
        // translate Y
        uint scale = getRandomValue(0, 6, localSeed);
        uint delta = (scale * sizeY) / 2;
        bool isNeg = getCoinFlip(abi.encodePacked(localSeed, i));
        if (isNeg && delta <= posY) {
          posY = (posY - delta) % 600;
        } else {
          posY = (posY + delta) % 600;
        }
      }
      if (opcode == 0x5 || opcode == 0x6 || opcode == 0xA || opcode == 0xB || opcode == 0xC || opcode == 0xD || opcode == 0xE || opcode == 0xF) {
        // translate 3D
        uint scale = getRandomValue(0, 6, localSeed);
        uint delta = (scale * (sizeX / 2)) / 2; 
        posX = delta;
        posY += getYFromThirtyAngle(delta); 
                // uint negOrNot = getRandomValue(0, 2, abi.encodePacked(localSeed, i));
        // TODO clamp
      }
      string memory d = getPrismD(posX, posY, sizeX, sizeY);
      string memory path = getPrismPath(d, pallete[colorIndex].toHexStringWithColorPrefix(3));
      paths = string(
        abi.encodePacked(
          paths,
          path
        )
      );
    }

    svg = 
      string(
          abi.encodePacked(
              '<svg width="600" height="600" viewBox="0 0 600 600">',
              '<rect x="0" y="0" width="100%" height="100%"/>',
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