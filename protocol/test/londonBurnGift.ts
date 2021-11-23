import { ethers, network, waffle } from 'hardhat';
import { BigNumber, Signer, utils } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { expect } from 'chai';
import { chunk } from 'lodash';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { deployments } from '../deployments';
import { newArray } from './utils';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const ONE_ETH = ethers.utils.parseUnits('1', 'ether');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const GIFT_TYPE =
  '0x8000000000000000000000000000000200000000000000000000000000000000';
const ULTRASONIC_TYPE =
  '0x8000000000000000000000000000000600000000000000000000000000000000';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';
const TEAM_ADDRESS = '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4';
const LONDON_WHALE_ADDRESS = '0x7C849375786faE5e4984F50eea47360D75660a31';
const ULTRASONIC_BLOCK = 15_000_000;
const MAX_BLOCK_NUM =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

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
  uris: string[];
  to: string;
  tokenType: string;
  signature: string;
}

const numBurnFromGiftAmount = (n: number) => n * 2 - 1;

describe('LondonBurnGift', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let londonBurnMinter: LondonBurnMinter;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let airdropAuthority: Signer;
  let minter: Signer;
  let londonWhale: Signer;
  let erc20Mintable: ERC20Mintable;
  let erc721Mintable: ERC721Mintable;
  let mintCheckCounter = 0;

  const getMintCheck = async (to: string, num: number, tokenType: string) => {
    const uris: string[] = [];

    for (let i = 0; i < num; ++i) {
      const str = 'mintcheck' + (mintCheckCounter + i);
      uris.push(str);
    }

    mintCheckCounter += num;

    const mintCheck: MintCheck = {
      tokenType,
      uris,
      to,
      signature: BAD_SIGNATURE,
    };

    const mintCheckHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256', ...newArray(uris.length).map((_) => 'string')],
      [mintCheck.to, mintCheck.tokenType, ...mintCheck.uris],
    );

    const bytesMintCheckHash = ethers.utils.arrayify(mintCheckHash);

    const mintCheckHashSig = await mintingAuthority.signMessage(
      bytesMintCheckHash,
    );

    mintCheck.signature = mintCheckHashSig;

    return mintCheck;
  };

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    treasury = accounts[2];
    mintingAuthority = accounts[3];
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [TEAM_ADDRESS],
    });
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [LONDON_WHALE_ADDRESS],
    });
    minter = await ethers.getSigner(TEAM_ADDRESS);
    londonWhale = await ethers.getSigner(LONDON_WHALE_ADDRESS);
    airdropAuthority = mintingAuthority;

    const Erc20Mintable = await ethers.getContractFactory('ERC20Mintable');
    erc20Mintable = (await Erc20Mintable.attach(
      deployments[1].erc20,
    )) as ERC20Mintable;
    await erc20Mintable.deployed();

    // top up minter address
    await rando.sendTransaction({
      to: await minter.getAddress(),
      value: (await rando.getBalance()).div(4),
    });

    await rando.sendTransaction({
      to: await londonWhale.getAddress(),
      value: (await rando.getBalance()).div(4),
    });

    await erc20Mintable
      .connect(londonWhale)
      .transfer(await minter.getAddress(), await utils.parseEther('500000'));
  });

  beforeEach(async function () {
    const ERC721Mintable = await ethers.getContractFactory('ERC721Mintable');
    erc721Mintable = (await ERC721Mintable.deploy(
      'TEST',
      'TEST',
    )) as ERC721Mintable;
    await erc721Mintable.deployed();

    const LondonBurn = await ethers.getContractFactory('LondonBurn');

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
      deployments[1].erc20,
      erc721Mintable.address,
      deployments[1].sushiswap,
    )) as LondonBurnMinter;
    await londonBurnMinter.deployed();
    await londonBurn.setMinter(londonBurnMinter.address);
    await londonBurnMinter.connect(owner).setRevealBlockNumber(0);
    await londonBurnMinter
      .connect(owner)
      .setTreasury(await treasury.getAddress());
    await londonBurn
      .connect(owner)
      .setMintingAuthority(await mintingAuthority.getAddress());
    await londonBurnMinter
      .connect(owner)
      .setAirdropAuthority(await airdropAuthority.getAddress());
  });

  describe('numBurnFromGiftAmount', () => {
    it('should calculate value', async function () {
      expect(await londonBurnMinter.numBurnFromGiftAmount(2)).to.eq(
        BigNumber.from(numBurnFromGiftAmount(2)),
      );
      expect(await londonBurnMinter.numBurnFromGiftAmount(15)).to.eq(
        BigNumber.from(numBurnFromGiftAmount(15)),
      );
    });
    it('should return flat value after ultrasonicfork', async function () {
      await londonBurnMinter.setUltraSonicForkBlockNumber(1);
      expect(await londonBurnMinter.numBurnFromGiftAmount(2)).to.eq(
        BigNumber.from(1),
      );
      expect(await londonBurnMinter.numBurnFromGiftAmount(15)).to.eq(
        BigNumber.from(1),
      );
    });
  });

  describe('londonNeededFromGiftAmount', () => {
    it('should calculate value', async function () {
      expect(await londonBurnMinter.londonNeededFromGiftAmount(2)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[2],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(3)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[3],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(4)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[4],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(5)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[5],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(6)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[6],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(7)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[7],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(8)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[8],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(9)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[9],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(10)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[10],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(11)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[11],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(12)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[12],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(13)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[13],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(14)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[14],
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(15)).to.eq(
        BURN_LONDON_FEE_FOR_GIFTS[15],
      );
    });
    it('should return flat value after ultrasonicfork', async function () {
      await londonBurnMinter.setUltraSonicForkBlockNumber(1);
      expect(await londonBurnMinter.londonNeededFromGiftAmount(2)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559),
      );
      expect(await londonBurnMinter.londonNeededFromGiftAmount(15)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559),
      );
    });
  });

  describe('mintGiftType', () => {
    const mintBurnableNft = async (signer: Signer, n: number) => {
      let maxIndex = (await erc721Mintable.maxIndex()).toNumber();
      const tokenIds: number[] = [];
      for (let i = 0; i < n; ++i) {
        await erc721Mintable.connect(signer).mint();
        tokenIds.push(maxIndex++);
      }
      return tokenIds;
    };

    it('should correctly mint and burn GIFTs', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      const numBurned = 4;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned],
        );
      // mint gift type
      await londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck);
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(BURN_LONDON_FEE_FOR_GIFTS[numBurned]);
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await erc721Mintable.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(GIFT_TYPE)).to.eq(
        numBurnFromGiftAmount(numBurned),
      );
    });

    it('should correctly mint and burn GIFTs with ETH', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      const numBurned = 4;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      // mint gift type
      await londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck, {
        value: ONE_ETH,
      });
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(BURN_LONDON_FEE_FOR_GIFTS[numBurned]);
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await erc721Mintable.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(GIFT_TYPE)).to.eq(
        numBurnFromGiftAmount(numBurned),
      );
      expect(await waffle.provider.getBalance(londonBurnMinter.address)).to.eq(
        BigNumber.from(0),
      );
    });
    it('should not mint if not enough $LONDON', async function () {
      const numBurned = 6;
      const tokenIds = await mintBurnableNft(rando, numBurned);
      await erc721Mintable
        .connect(rando)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await rando.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(rando)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned],
        );
      await expect(
        londonBurnMinter.connect(rando).mintGiftType(tokenIds, mintCheck),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
    it('should not mint if not enough ETH', async function () {
      const numBurned = 6;
      const tokenIds = await mintBurnableNft(rando, numBurned);
      await erc721Mintable
        .connect(rando)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await rando.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      await expect(
        londonBurnMinter.connect(rando).mintGiftType(tokenIds, mintCheck, {
          value: ONE_GWEI,
        }),
      ).to.revertedWith('UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
    });
    it('should not mint if not revealed', async function () {
      await londonBurnMinter.setRevealBlockNumber(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      );
      const numBurned = 4;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned],
        );
      await expect(
        londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck),
      ).to.revertedWith('GIFT has not been revealed yet');
    });
    it('should not mint if max burnt', async function () {
      console.log('COMMENTED OUT');
      // let totalNumBurned = 0;
      // while(totalNumBurned < MAX_TOTAL_GIFT_BURN_AMOUNT) {
      //   const numBurned = 15;
      //   const tokenIds = await mintBurnableNft(minter, numBurned);
      //   await erc721Mintable.connect(minter).setApprovalForAll(londonBurn.address, true);
      //   const mintCheck = await getMintCheck(await minter.getAddress(), numBurnFromGiftAmount(numBurned));
      //   await erc20Mintable.connect(owner).mint(await minter.getAddress(), BURN_LONDON_FEE_FOR_GIFTS[numBurned]);
      //   await erc20Mintable.connect(minter).approve(londonBurn.address, BURN_LONDON_FEE_FOR_GIFTS[numBurned]);
      //   // mint gift type
      //   await londonBurn.connect(minter).mintGiftType(tokenIds, mintCheck);
      //   totalNumBurned += numBurned;
      // }
      // const numBurned = 11;
      // const tokenIds = await mintBurnableNft(minter, numBurned);
      // await erc721Mintable.connect(minter).setApprovalForAll(londonBurn.address, true);
      // const mintCheck = await getMintCheck(await minter.getAddress(), numBurnFromGiftAmount(numBurned));
      // await erc20Mintable.connect(owner).mint(await minter.getAddress(), BURN_LONDON_FEE_FOR_GIFTS[numBurned]);
      // await erc20Mintable.connect(minter).approve(londonBurn.address, BURN_LONDON_FEE_FOR_GIFTS[numBurned]);
      // await expect(
      //   londonBurn.connect(minter).mintGiftType(tokenIds, mintCheck),
      // ).to.revertedWith('Max GIFT burnt');
    });
    it('should not mint if under 2', async function () {
      const numBurned = 1;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned] ?? BigNumber.from(0),
        );
      await expect(
        londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck),
      ).to.revertedWith('Exceeded gift burn range');
    });
    it('should not mint if over 15', async function () {
      const numBurned = 16;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned),
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned] ?? BigNumber.from(0),
        );
      await expect(
        londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck),
      ).to.revertedWith('Exceeded gift burn range');
    });
    it('should not mint if not enough mintCheck', async function () {
      const numBurned = 4;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned) - 1,
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned] ?? BigNumber.from(0),
        );
      await expect(
        londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck),
      ).to.revertedWith('MintCheck required mismatch');
    });
    it('should not mint if too much mintCheck', async function () {
      const numBurned = 4;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromGiftAmount(numBurned) + 1,
        GIFT_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          BURN_LONDON_FEE_FOR_GIFTS[numBurned] ?? BigNumber.from(0),
        );
      await expect(
        londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck),
      ).to.revertedWith('MintCheck required mismatch');
    });
    it('should mint ultrasonic conditions', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      await londonBurnMinter.setUltraSonicForkBlockNumber(0);
      const numBurned = 6;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        1,
        ULTRASONIC_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(londonBurnMinter.address, ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      // mint gift type
      await londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck);
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await erc721Mintable.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ULTRASONIC_TYPE)).to.eq(1);
    });
    it('should mint ultrasonic conditions with ETH', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      await londonBurnMinter.setUltraSonicForkBlockNumber(0);
      const numBurned = 6;
      const tokenIds = await mintBurnableNft(minter, numBurned);
      await erc721Mintable
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        1,
        ULTRASONIC_TYPE,
      );
      // mint gift type
      await londonBurnMinter.connect(minter).mintGiftType(tokenIds, mintCheck, {
        value: ONE_ETH,
      });
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await erc721Mintable.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ULTRASONIC_TYPE)).to.eq(1);
      expect(await waffle.provider.getBalance(londonBurnMinter.address)).to.eq(
        BigNumber.from(0),
      );
    });
  });
});
