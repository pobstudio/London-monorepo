import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain/LondonBurn';
import { ERC20Mintable } from '../typechain/ERC20Mintable';
import { ERC721Mintable } from '../typechain/ERC721Mintable';
import { expect } from 'chai';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const ETERNAL_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';

const ULTRASONIC_BLOCK = 15_000_000;

interface MintCheck {
  URI: string;
  to: string;
  signature: string;
}

describe('LondonBurnBase', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let minter: Signer;
  let erc20Mintable: ERC20Mintable;
  let erc721Mintable: ERC721Mintable;

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
      erc20Mintable.address,
      erc721Mintable.address,
    )) as LondonBurn;
    await londonBurn.deployed();
  });

  describe('Contract Parameters', () => {
    it('should be set correctly', async () => {
      expect(await londonBurn.payableErc20()).to.eq(erc20Mintable.address);
      expect(await londonBurn.externalBurnableERC721()).to.eq(
        erc721Mintable.address,
      );
    });
  });

  describe('setTreasury', () => {
    it('should set new treasury address', async function () {
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      expect(await londonBurn.treasury()).to.eq(await treasury.getAddress());
    });
    it('should not set new treasury address by rando', async function () {
      await expect(
        londonBurn.connect(rando).setTreasury(await treasury.getAddress()),
      ).to.reverted;
    });
  });

  describe('setMintingAuthority', () => {
    it('should set new mintingAuthority address', async function () {
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      expect(await londonBurn.mintingAuthority()).to.eq(
        await mintingAuthority.getAddress(),
      );
    });
    it('should not set new mintingAuthority address by rando', async function () {
      await expect(
        londonBurn
          .connect(rando)
          .setMintingAuthority(await mintingAuthority.getAddress()),
      ).to.reverted;
    });
  });

  describe('setUltraSonicForkBlockNumber', () => {
    it('should set new ultraSonicForkBlockNumber address', async function () {
      await londonBurn
        .connect(owner)
        .setUltraSonicForkBlockNumber(ULTRASONIC_BLOCK);
      expect(await londonBurn.ultraSonicForkBlockNumber()).to.eq(
        ULTRASONIC_BLOCK,
      );
    });
    it('should not set new ultraSonicForkBlockNumber address by rando', async function () {
      await expect(
        londonBurn
          .connect(rando)
          .setUltraSonicForkBlockNumber(ULTRASONIC_BLOCK),
      ).to.reverted;
    });
  });

  describe('getMintCheckHash', () => {
    it('should produce correct hash', async function () {
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await minter.getAddress(),
        signature: BAD_SIGNATURE,
      };

      const mintCheckHash = ethers.utils.solidityKeccak256(
        ['address', 'string'],
        [mintCheck.to, mintCheck.URI],
      );

      expect(await londonBurn.getMintCheckHash(mintCheck)).to.eq(mintCheckHash);
    });
  });

  describe('verifyMintCheck', () => {
    it('should produce correct hash', async function () {
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await minter.getAddress(),
        signature: BAD_SIGNATURE,
      };

      const mintCheckHash = ethers.utils.solidityKeccak256(
        ['address', 'string'],
        [mintCheck.to, mintCheck.URI],
      );

      const bytesMintCheckHash = ethers.utils.arrayify(mintCheckHash);

      const mintCheckHashSig = await mintingAuthority.signMessage(
        bytesMintCheckHash,
      );

      mintCheck.signature = mintCheckHashSig;

      expect(await londonBurn.verifyMintCheck(mintCheck)).to.eq(true);
    });
  });
});
