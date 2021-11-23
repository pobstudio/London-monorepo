import { ethers, network, waffle } from 'hardhat';
import { BigNumber, Signer, utils } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { expect } from 'chai';
import { chunk } from 'lodash';
import { deployments } from '../deployments';
import { newArray } from './utils';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const ONE_ETH = ethers.utils.parseUnits('1', 'ether');
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
const MAX_BLOCK_NUM =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const TEAM_ADDRESS = '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4';
const LONDON_WHALE_ADDRESS = '0x7C849375786faE5e4984F50eea47360D75660a31';

interface MintCheck {
  uris: string[];
  to: string;
  tokenType: string;
  signature: string;
}

const numBurnFromSelfAmount = (n: number) => n - 1;

describe('LondonBurnAshen', function () {
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

    const ERC721Mintable = await ethers.getContractFactory('ERC721Mintable');
    erc721Mintable = (await ERC721Mintable.attach(
      deployments[1].gift,
    )) as ERC721Mintable;
    await erc721Mintable.deployed();

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
      deployments[1].gift,
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

  describe('numBurnFromSelfAmount', () => {
    it('should calculate value', async function () {
      expect(await londonBurnMinter.numBurnFromSelfAmount(2)).to.eq(
        BigNumber.from(numBurnFromSelfAmount(2)),
      );
      expect(await londonBurnMinter.numBurnFromSelfAmount(15)).to.eq(
        BigNumber.from(numBurnFromSelfAmount(15)),
      );
    });
  });

  describe('londonNeededFromSelfAmount', () => {
    it('should calculate value', async function () {
      expect(await londonBurnMinter.londonNeededFromSelfAmount(2)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(2),
      );
      expect(await londonBurnMinter.londonNeededFromSelfAmount(15)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(15),
      );
    });
    it('should return flat value after ultrasonicfork', async function () {
      await londonBurnMinter.setUltraSonicForkBlockNumber(1);
      expect(await londonBurnMinter.londonNeededFromSelfAmount(2)).to.eq(
        ONE_TOKEN_IN_BASE_UNITS.mul(1559),
      );
      expect(await londonBurnMinter.londonNeededFromSelfAmount(15)).to.eq(
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
        await londonBurnMinter
          .connect(signer)
          .mintEternalType(
            await getMintCheck(await treasury.getAddress(), 1, ETERNAL_TYPE),
          );
        tokenIds.push(BigNumber.from(ETERNAL_TYPE).or(++maxIndex));
      }
      for (let i = 0; i < n; ++i) {
        await londonBurn
          .connect(treasury)
          .transferFrom(await treasury.getAddress(), await signer.getAddress(), tokenIds[i]);
      }
      return tokenIds;
    };

    it('should correctly mint and burn self with $LONDON', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      // mint gift type
      await londonBurnMinter
        .connect(minter)
        .mintAshenType(tokenIds, mintCheck);
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned));
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await londonBurn.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ASHEN_TYPE)).to.eq(
        numBurnFromSelfAmount(numBurned),
      );
    });
    it('should correctly mint and burn self with ETH', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      // mint gift type
      await londonBurnMinter
        .connect(minter)
        .mintAshenType(tokenIds, mintCheck, {
          value: ONE_ETH.mul(10),
        });
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned));
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await londonBurn.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ASHEN_TYPE)).to.eq(
        numBurnFromSelfAmount(numBurned),
      );
      expect(await waffle.provider.getBalance(londonBurnMinter.address)).to.eq(
        BigNumber.from(0),
      );
    });
    it('should not mint if not enough $LONDON', async function () {
      const numBurned = 6;
      const tokenIds = await mintEternalNft(rando, numBurned);
      await londonBurn
        .connect(rando)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await rando.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(rando)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(rando).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
    it('should not mint if not enough ETH', async function () {
      const numBurned = 6;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck, {
          value: ONE_GWEI,
        }),
      ).to.revertedWith('UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
    });
    it('should not mint if not revealed', async function () {
      const numBurned = 6;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurnMinter.setRevealBlockNumber(MAX_BLOCK_NUM);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('ASHEN has not been revealed yet');
    });
    it('should not mint if under 3', async function () {
      const numBurned = 2;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('Exceeded self burn range');
    });
    it('should not mint if over 7', async function () {
      const numBurned = 8;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('Exceeded self burn range');
    });
    it('should not mint if not enough mintCheck', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned) - 1,
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('MintCheck required mismatch');
    });
    it('should not mint if too much mintCheck', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned) + 1,
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          ONE_TOKEN_IN_BASE_UNITS.mul(1559).mul(numBurned),
        );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('MintCheck required mismatch');
    });
    it('should mint ultrasonic conditions', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurnMinter.setUltraSonicForkBlockNumber(0);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ULTRASONIC_TYPE,
      );
      await erc20Mintable
        .connect(minter)
        .approve(londonBurnMinter.address, ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      // mint gift type
      await londonBurnMinter
        .connect(minter)
        .mintAshenType(tokenIds, mintCheck);
      // check treasury get london
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      // check tokens are burnt
      for (const tokenId of tokenIds) {
        expect(await londonBurn.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ULTRASONIC_TYPE)).to.eq(
        numBurnFromSelfAmount(numBurned),
      );
    });
    it('should mint ultrasonic conditions with ETH', async function () {
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurnMinter.setUltraSonicForkBlockNumber(0);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ULTRASONIC_TYPE,
      );
      // mint gift type
      await londonBurnMinter
        .connect(minter)
        .mintAshenType(tokenIds, mintCheck, {
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
        expect(await londonBurn.ownerOf(tokenId)).to.eq(DEAD_ADDRESS);
      }
      // check new tokens are minted
      expect(await londonBurn.tokenTypeSupply(ULTRASONIC_TYPE)).to.eq(
        numBurnFromSelfAmount(numBurned),
      );
      expect(await waffle.provider.getBalance(londonBurnMinter.address)).to.eq(
        BigNumber.from(0),
      );
    });
    it('should not mint ultrasonic conditions if $LONDON mismatch', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(rando, numBurned);
      await londonBurnMinter.setUltraSonicForkBlockNumber(0);
      await londonBurn
        .connect(rando)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await rando.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await erc20Mintable
        .connect(rando)
        .approve(londonBurnMinter.address, ONE_TOKEN_IN_BASE_UNITS.mul(1559));
      await expect(
        londonBurnMinter.connect(rando).mintAshenType(tokenIds, mintCheck),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
    it('should not mint ultrasonic conditions if ETH mismatch', async function () {
      const numBurned = 4;
      const tokenIds = await mintEternalNft(minter, numBurned);
      await londonBurnMinter.setUltraSonicForkBlockNumber(0);
      await londonBurn
        .connect(minter)
        .setApprovalForAll(londonBurnMinter.address, true);
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        numBurnFromSelfAmount(numBurned),
        ASHEN_TYPE,
      );
      await expect(
        londonBurnMinter.connect(minter).mintAshenType(tokenIds, mintCheck, {
          value: ONE_GWEI,
        }),
      ).to.revertedWith('UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
    });
  });
});
