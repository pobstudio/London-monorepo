import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { expect } from 'chai';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const ETERNAL_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';

const ULTRASONIC_BLOCK = 15_000_000;

const SUSHISWAP_ADDRESS = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';

describe('LondonBurnMinterBase', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let londonBurnMinter: LondonBurnMinter;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let minter: Signer;
  let erc20Mintable: ERC20Mintable;
  let erc721Mintable: ERC721Mintable;
  let mintCheckCounter = 0;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    treasury = accounts[2];
    mintingAuthority = accounts[3];
    minter = accounts[4];
  });

  beforeEach(async function () {
    const LondonBurn = await ethers.getContractFactory('LondonBurn');

    const Erc20Mintable = await ethers.getContractFactory('ERC20Mintable');
    erc20Mintable = (await Erc20Mintable.deploy(
      await owner.getAddress(),
      'Mintable',
      'Mintable',
    )) as ERC20Mintable;
    await erc20Mintable.deployed();

    const ERC721Mintable = await ethers.getContractFactory('ERC721Mintable');
    erc721Mintable = (await ERC721Mintable.deploy(
      'TEST',
      'TEST',
    )) as ERC721Mintable;
    await erc721Mintable.deployed();

    londonBurn = (await LondonBurn.deploy(
      'London Embers',
      'EMBER',
    )) as LondonBurn;
    await londonBurn.deployed();

    const LondonBurnMinter = await ethers.getContractFactory(
      'LondonBurnMinter',
    );
    londonBurnMinter = (await LondonBurnMinter.deploy(
      londonBurn.address,
      erc20Mintable.address,
      erc721Mintable.address,
      SUSHISWAP_ADDRESS,
    )) as LondonBurnMinter;
    await londonBurnMinter.deployed();
    await londonBurn.setMinter(londonBurnMinter.address);
  });

  describe('setTreasury', () => {
    it('should set new treasury address', async function () {
      await londonBurnMinter
        .connect(owner)
        .setTreasury(await treasury.getAddress());
      expect(await londonBurnMinter.treasury()).to.eq(
        await treasury.getAddress(),
      );
    });
    it('should not set new treasury address by rando', async function () {
      await expect(
        londonBurnMinter
          .connect(rando)
          .setTreasury(await treasury.getAddress()),
      ).to.reverted;
    });
  });

  describe('setUltraSonicForkBlockNumber', () => {
    it('should set new ultraSonicForkBlockNumber address', async function () {
      await londonBurnMinter
        .connect(owner)
        .setUltraSonicForkBlockNumber(ULTRASONIC_BLOCK);
      expect(await londonBurnMinter.ultraSonicForkBlockNumber()).to.eq(
        ULTRASONIC_BLOCK,
      );
    });
    it('should not set new ultraSonicForkBlockNumber address by rando', async function () {
      await expect(
        londonBurnMinter
          .connect(rando)
          .setUltraSonicForkBlockNumber(ULTRASONIC_BLOCK),
      ).to.reverted;
    });
  });

  describe('setRevealBlockNumber', () => {
    it('should set new revealBlockNumber address', async function () {
      await londonBurnMinter
        .connect(owner)
        .setRevealBlockNumber(ULTRASONIC_BLOCK);
      expect(await londonBurnMinter.revealBlockNumber()).to.eq(
        ULTRASONIC_BLOCK,
      );
    });
    it('should not set new revealBlockNumber address by rando', async function () {
      await expect(
        londonBurnMinter.connect(rando).setRevealBlockNumber(ULTRASONIC_BLOCK),
      ).to.reverted;
    });
  });

  describe('setBurnRevealBlockNumber', () => {
    it('should set new revealBlockNumber address', async function () {
      await londonBurnMinter
        .connect(owner)
        .setBurnRevealBlockNumber(ULTRASONIC_BLOCK);
      expect(await londonBurnMinter.burnRevealBlockNumber()).to.eq(
        ULTRASONIC_BLOCK,
      );
    });
    it('should not set new revealBlockNumber address by rando', async function () {
      await expect(
        londonBurnMinter.connect(rando).setBurnRevealBlockNumber(ULTRASONIC_BLOCK),
      ).to.reverted;
    });
  });
});
