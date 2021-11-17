import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain/LondonBurn';
import { ERC20Mintable } from '../typechain/ERC20Mintable';
import { ERC721Mintable } from '../typechain/ERC721Mintable';
import { expect } from 'chai';
import { chunk } from 'lodash';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const ETERNAL_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';
const ASHEN_TYPE =
  '0x8000000000000000000000000000000500000000000000000000000000000000';
const ULTRASONIC_TYPE =
  '0x8000000000000000000000000000000600000000000000000000000000000000';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';
const ULTRASONIC_BLOCK = 15_000_000;
const MAX_TOTAL_GIFT_BURN_AMOUNT = 1559;

const BURN_LONDON_FEE_FOR_GIFTS: { [key: number]: BigNumber } = {
  2: ONE_TOKEN_IN_BASE_UNITS.mul(3375),
  3: ONE_TOKEN_IN_BASE_UNITS.mul(4629),
  4: ONE_TOKEN_IN_BASE_UNITS.mul(5359),
  5: ONE_TOKEN_IN_BASE_UNITS.mul(5832),
  6: ONE_TOKEN_IN_BASE_UNITS.mul(6162),
  7: ONE_TOKEN_IN_BASE_UNITS.mul(6405),
  8: ONE_TOKEN_IN_BASE_UNITS.mul(6591),
  9: ONE_TOKEN_IN_BASE_UNITS.mul(6739),
  10: ONE_TOKEN_IN_BASE_UNITS.mul(6859),
  11: ONE_TOKEN_IN_BASE_UNITS.mul(6958),
  12: ONE_TOKEN_IN_BASE_UNITS.mul(7041),
  13: ONE_TOKEN_IN_BASE_UNITS.mul(7111),
  14: ONE_TOKEN_IN_BASE_UNITS.mul(7173),
  15: ONE_TOKEN_IN_BASE_UNITS.mul(7226),
};

interface MintCheck {
  URI: string;
  to: string;
  signature: string;
}

const numBurnFromSelfAmount = (n: number) => n - 1;

describe('LondonBurnAshen', function () {
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

  let mintCheckCounter = 0;

  const getMintChecks = async (to: string, num: number) => {
    const mintChecks: MintCheck[] = [];

    for (let i = 0; i < num; ++i) {
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck' + mintCheckCounter + i,
        to,
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
      mintChecks.push(mintCheck);
    }
    mintCheckCounter += num;
    return mintChecks;
  };

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

  describe('numBurnFromSelfAmount', () => {
    it('should calculate value', async function () {
      expect(await londonBurn.numBurnFromSelfAmount(2)).to.eq(
        BigNumber.from(numBurnFromSelfAmount(2)),
      );
      expect(await londonBurn.numBurnFromSelfAmount(15)).to.eq(
        BigNumber.from(numBurnFromSelfAmount(15)),
      );
    });
  });

  describe('londonNeededFromSelfAmount', () => {
    it('should calculate value', async function () {
      expect(await londonBurn.londonNeededFromSelfAmount(2)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(2),
      );
      expect(await londonBurn.londonNeededFromSelfAmount(15)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(15),
      );
    });
    it('should return flat value after ultrasonicfork', async function () {
      await londonBurn.setUltraSonicForkBlockNumber(1);
      expect(await londonBurn.londonNeededFromSelfAmount(2)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559),
      );
      expect(await londonBurn.londonNeededFromSelfAmount(15)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559),
      );
    });
  });

  describe('mintAshenType', () => {
    const mintEternalNft = async (signer: Signer, n: number) => {
      let maxIndex = (
        await londonBurn.tokenTypeSupply(ETERNAL_TYPE)
      ).toNumber();
      const tokenIds: BigNumber[] = [];
      for (let i = 0; i < n; ++i) {
        await londonBurn
          .connect(treasury)
          .mintEternalType(await getMintChecks(await signer.getAddress(), 1));
        tokenIds.push(BigNumber.from(ETERNAL_TYPE).or(++maxIndex));
      }
      return tokenIds;
    };

    beforeEach(async () => {
      await londonBurn.setRevealBlockNumber(0);
      await londonBurn.setMintingAuthority(await mintingAuthority.getAddress());
      await londonBurn.setTreasury(await treasury.getAddress());
    });

    it('should correctly mint and burn self', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      // mint gift type
      await londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks);
      // check treasury get london
      expect(await erc20Mintable.balanceOf(await treasury.getAddress())).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
      );
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await londonBurn.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ASHEN_TYPE)).to.eq(
        numBurnFromSelfAmount(numBurned),
      );
    });
    it('should not mint if not enough $LONDON', async function () {
      const numBurned = 6;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned).sub(1),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
    it('should not mint if not revealed', async function () {
      const numBurned = 6;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn.setRevealBlockNumber(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      );
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned).sub(1),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('ASHEN has not been revealed yet');
    });
    it('should not mint if under 3', async function () {
      const numBurned = 2;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned).sub(1),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('Exceeded self burn range');
    });
    it('should not mint if over 7', async function () {
      const numBurned = 8;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned).sub(1),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('Exceeded self burn range');
    });
    it('should not mint if not enough mintChecks', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned) - 1,
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('MintChecks required mismatch');
    });
    it('should not mint if too much mintChecks', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned) + 1,
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('MintChecks required mismatch');
    });
    it('should mint ultrasonic conditions', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn.setUltraSonicForkBlockNumber(0);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(await minter.getAddress(), ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      await erc20Mintable
        .connect(minter)
        .approve(londonBurn.address, ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      // mint gift type
      await londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks);
      // check treasury get london
      expect(await erc20Mintable.balanceOf(await treasury.getAddress())).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559),
      );
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await londonBurn.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ULTRASONIC_TYPE)).to.eq(
        numBurnFromSelfAmount(numBurned),
      );
    });
    it('should not mint ultrasonic conditions if $LONDON mismatch', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn.setUltraSonicForkBlockNumber(0);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurn.address, true);
      const mintChecks = await getMintChecks(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
      );
      await erc20Mintable
        .connect(owner)
        .mint(
          await minter.getAddress(),
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).sub(1),
        );
      await erc20Mintable
        .connect(minter)
        .approve(londonBurn.address, ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      await expect(
        londonBurn.connect(minter).mintAshenType(tokenIds, mintChecks),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
  });
});
