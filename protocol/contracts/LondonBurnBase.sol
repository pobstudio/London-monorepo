// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./ERC721.sol";
import "./Ownable.sol";
import "./utils/Strings.sol";
import "./utils/Signature.sol";

contract LondonBurnBase is Ownable, ERC721 {
    using Strings for uint256;

    // $LONDON
    ERC20 public immutable payableErc20;

    // LONDON GIFT
    ERC721 public immutable externalBurnableERC721;

    // addresses
    address public treasury;

    mapping(uint256 => uint256) tokenTypeSupply;

    string public contractURI;

    // token types
    uint256 constant NOBLE_TYPE =    0x8000000000000000000000000000000100000000000000000000000000000000;
    uint256 constant GIFT_TYPE =     0x8000000000000000000000000000000200000000000000000000000000000000;
    uint256 constant PRISTINE_TYPE = 0x8000000000000000000000000000000300000000000000000000000000000000;
    uint256 constant ETERNAL_TYPE =  0x8000000000000000000000000000000400000000000000000000000000000000;
    uint256 constant ASHEN_TYPE =    0x8000000000000000000000000000000500000000000000000000000000000000;
    uint256 constant ULTRA_SONIC_TYPE =   0x8000000000000000000000000000000600000000000000000000000000000000;

    uint256 public ultraSonicForkBlockNumber = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

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

    function setContractURI(string calldata newContractURI) external onlyOwner {
        contractURI = newContractURI;
    }

    function setUltraSonicForkBlockNumber(uint256 _ultraSonicForkBlockNumber) external onlyOwner {
        ultraSonicForkBlockNumber = _ultraSonicForkBlockNumber;
    }

    function _mintTokenType(address to, uint256 tokenType, uint256 numMints) internal {
      for (uint i = 0; i < numMints; ++i) {
        _mint(to, (tokenType & ++tokenTypeSupply[tokenType]));
      }
    }

    function _payLondon(address from, uint256 amount) internal {
      payableErc20.transferFrom(from, treasury, amount);
    }
}