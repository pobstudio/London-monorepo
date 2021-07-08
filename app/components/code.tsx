import { FC } from 'react';
import styled from 'styled-components';
import { TOKEN_SYMBOL } from '../constants';
import {
  BELL_CURVE_A,
  BELL_CURVE_B,
  BELL_CURVE_C,
  BELL_CURVE_D,
  BLOCK_NUMBER_UP_TO,
} from '../constants/parameters';
import { BREAKPTS } from '../styles';

const CodeContainer = styled.div`
  border: 1px solid black;
  width: 800px;
  margin: 20px 0;
  padding: 12px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
    margin: 20px 24px;
  }
`;

const Code = styled.code`
  font-family: 'Computer Modern Typewriter';
  white-space: pre-wrap;
`;

export const ERC20Code: FC = () => {
  return (
    <CodeContainer>
      <Code>
        {`
// Standard ERC20 Contract for ${TOKEN_SYMBOL}
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

`}
      </Code>
    </CodeContainer>
  );
};
export const MinterCode: FC = () => {
  return (
    <CodeContainer>
      <Code>
        {`
// PARAMETERS 
// blockNumberUpTo: ${BLOCK_NUMBER_UP_TO}
// a: ${BELL_CURVE_A.toString()}
// b: ${BELL_CURVE_B.toString()}
// c: ${BELL_CURVE_C.toString()}
// d: ${BELL_CURVE_D.toString()}

contract BellCurveParametersStorage {
    
    uint256 immutable public a;
    uint256 immutable public b;
    uint256 immutable public c;
    uint256 immutable public d;

    uint256 constant SIG_DIGITS = 3;

    constructor(uint256 _a, uint256 _b, uint256 _c, uint256 _d) {
      a = _a;
      b = _b;
      c = _c;
      d = _d;
    }

    function bellCurve(uint256 x) internal view returns (uint256 y) {
      uint256 decimals = 10 ** SIG_DIGITS;
      // since it is all uints, we will use a ternary to keep it positive 
      uint256 xDiffC = x > c ? (x - c) : (c - x);
      // this complex set of math gets us a bell curve with the ouput in SIG_DIGITS worth of decimals
      return (10 ** (18 - SIG_DIGITS)) * ((d * decimals * decimals) / (decimals + (((xDiffC * decimals) / a))**(2 * b) / decimals));
    }
}

contract GasPriceBasedMinter is BellCurveParametersStorage, Context, Ownable {
    ERC20Mintable public erc20;

    uint256 immutable public blockNumberUpTo;
    bytes32 constant ZERO_HASH = keccak256(0x00);

    constructor(uint256 _blockNumberUpTo, uint256 _a, uint256 _b, uint256 _c, uint256 _d) BellCurveParametersStorage(_a, _b, _c, _d) {
      blockNumberUpTo = _blockNumberUpTo;
    }

    function setErc20(address _erc20) public onlyOwner {
      erc20 = ERC20Mintable(_erc20);
    }

    function mintableTokenAtGasPrice(uint256 gasPrice)
      public
      view
      returns (uint256 amount)
    {
      amount = bellCurve(gasPrice);
    }

    fallback() external payable {
      require(block.number < blockNumberUpTo, "CAN'T $MINT ANYMORE");
      require(keccak256(msg.data) == ZERO_HASH, "CAN'T $MINT FROM MACHINE");
      require(msg.value == 0, "DON'T DONATE");
      uint256 amount = mintableTokenAtGasPrice(tx.gasprice);
      // mint amount to _msgSender
      erc20.mint(_msgSender(), amount);
    }
}

`}
      </Code>
    </CodeContainer>
  );
};
