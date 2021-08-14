import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { Erc20Mintable } from '../typechain/ERC20Mintable';
import { GasPriceBasedMinter } from '../typechain/GasPriceBasedMinter';
import { expect } from 'chai';

const TOKEN_SYMBOL = '$LONDON';
const TOKEN_NAME = '$LONDON';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');

describe('GasPriceBasedMinter', function () {
  // constant values used in transfer tests
  let erc20Mintable: Erc20Mintable;
  let gasPriceBasedMinter: GasPriceBasedMinter;
  let owner: Signer;
  let rando: Signer;
  let minter: Signer;

  const blockNumberUpTo = 1000;
  const a = BigNumber.from(15000).mul(ONE_MWEI);
  const b = BigNumber.from(1);
  const c = BigNumber.from(11590).mul(ONE_MWEI);
  const d = BigNumber.from(1159);

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    minter = accounts[2];
  });

  beforeEach(async function () {
    const GasPriceBasedMinter = await ethers.getContractFactory(
      'GasPriceBasedMinter',
    );
    gasPriceBasedMinter = (await GasPriceBasedMinter.deploy(
      blockNumberUpTo,
      a,
      b,
      c,
      d,
    )) as GasPriceBasedMinter;
    await gasPriceBasedMinter.deployed();

    const Erc20Mintable = await ethers.getContractFactory('ERC20Mintable');
    erc20Mintable = (await Erc20Mintable.deploy(
      gasPriceBasedMinter.address,
      TOKEN_NAME,
      TOKEN_SYMBOL,
    )) as Erc20Mintable;
    await erc20Mintable.deployed();
  });

  describe('setErc20', () => {
    it('should set new erc20 address', async function () {
      await gasPriceBasedMinter.connect(owner).setErc20(erc20Mintable.address);
      expect(await gasPriceBasedMinter.erc20()).to.eq(erc20Mintable.address);
    });
    it('should not set new erc20 address by rando', async function () {
      await expect(
        gasPriceBasedMinter.connect(rando).setErc20(erc20Mintable.address),
      ).to.reverted;
    });
  });

  describe('mintableTokenAtGasPrice', () => {
    it('value at 11.59 gwei is 1159 $LONDON', async function () {
      const x = BigNumber.from(11590).mul(ONE_MWEI);
      const y = BigNumber.from(1159).mul(ONE_TOKEN_IN_BASE_UNITS);
      const result = await gasPriceBasedMinter.mintableTokenAtGasPrice(x);
      expect(y).to.eq(result);
      console.log(result.toString());
    });
    it('value at 0 gwei should be 726.645 $LONDON', async function () {
      const x = BigNumber.from(0).mul(ONE_MWEI);
      const y = BigNumber.from('726645000000000000000');
      const result = await gasPriceBasedMinter.mintableTokenAtGasPrice(x);
      expect(y).to.eq(result);
      console.log(result.toString());
    });
    it('value at 23.18 gwei should be 726.645 $LONDON', async function () {
      const x = BigNumber.from(23180).mul(ONE_MWEI);
      const y = BigNumber.from('726645000000000000000');
      const result = await gasPriceBasedMinter.mintableTokenAtGasPrice(x);
      expect(y).to.eq(result);
      console.log(result.toString());
    });
    it('value at 46.36 gwei should be 181.860 $LONDON', async function () {
      const x = BigNumber.from(46360).mul(ONE_MWEI);
      const y = BigNumber.from('181860000000000000000');
      const result = await gasPriceBasedMinter.mintableTokenAtGasPrice(x);
      expect(y).to.eq(result);
      console.log(result.toString());
    });
  });

  describe('()', () => {
    beforeEach(async () => {
      await gasPriceBasedMinter.connect(owner).setErc20(erc20Mintable.address);
    });

    it('should mint based on gas price', async function () {
      await gasPriceBasedMinter.connect(owner).fallback({
        data: '0x00',
        gasPrice: BigNumber.from(11590).mul(ONE_MWEI),
      });
      const balance = await erc20Mintable.balanceOf(await owner.getAddress());
      const expectedBalance = BigNumber.from(1159).mul(ONE_TOKEN_IN_BASE_UNITS);
      expect(expectedBalance).to.eq(balance);
    });

    it('should mint based on gas price', async function () {
      await gasPriceBasedMinter.connect(owner).fallback({
        data: '0x00',
        gasPrice: BigNumber.from(23180).mul(ONE_MWEI),
      });
      const balance = await erc20Mintable.balanceOf(await owner.getAddress());
      const expectedBalance = BigNumber.from('726645000000000000000');
      expect(expectedBalance).to.eq(balance);
    });

    it('should not mint if value transferred', async function () {
      await expect(
        gasPriceBasedMinter.connect(owner).fallback({
          data: '0x00',
          value: ONE_MWEI,
          gasPrice: BigNumber.from(11590).mul(ONE_MWEI),
        }),
      ).to.be.revertedWith("DON'T DONATE");
    });

    it('should not mint if data is sent', async function () {
      await expect(
        gasPriceBasedMinter.connect(owner).fallback({
          data: '0x01',
          value: ONE_MWEI,
          gasPrice: BigNumber.from(11590).mul(ONE_MWEI),
        }),
      ).to.be.revertedWith("CAN'T $MINT FROM MACHINE");
    });

    it('should not mint if over block number', async function () {
      const blockNumber = await ethers.provider.getBlockNumber();

      const GasPriceBasedMinter = await ethers.getContractFactory(
        'GasPriceBasedMinter',
      );
      const gasPriceBasedMinter = (await GasPriceBasedMinter.deploy(
        blockNumber,
        a,
        b,
        c,
        d,
      )) as GasPriceBasedMinter;
      await gasPriceBasedMinter.deployed();

      await gasPriceBasedMinter.connect(owner).setErc20(erc20Mintable.address);

      await expect(
        gasPriceBasedMinter.connect(owner).fallback({
          data: '0x00',
          gasPrice: BigNumber.from(11590).mul(ONE_MWEI),
        }),
      ).to.be.revertedWith("CAN'T $MINT ANYMORE");
    });
  });
});
