import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { ERC20Mintable } from '../typechain/ERC20Mintable';
import { LondonGift } from '../typechain/LondonGift';
import { expect } from 'chai';
import { getAddress } from '@ethersproject/address';

const TOKEN_SYMBOL = '$LONDON';
const TOKEN_NAME = '$LONDON';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');

describe('LondonGift', function () {
  // constant values used in transfer tests
  let erc20Mintable: ERC20Mintable;
  let londonGift: LondonGift;
  let owner: Signer;
  let rando: Signer;
  let minter: Signer;
  let treasury: Signer;

  const name = '$LONDON Gift';
  const symbol = 'GIFT';

  const mintPrice = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
  const maxMintPerAddress = 5;
  const maxSupply = 21;
  const prefixSequenceValue = 10;
  const provenance =
    '0xcc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf';

  const baseMetadataURI = 'ipfs://test/';
  const contractURI = 'ipfs://contract/';
  const mintStartAtBlockNum = 1;
  const revealStartAtBlockNum = 100;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    minter = accounts[2];
    treasury = accounts[3];
  });

  beforeEach(async function () {
    const ERC20Mintable = await ethers.getContractFactory('ERC20Mintable');
    erc20Mintable = (await ERC20Mintable.deploy(
      await minter.getAddress(),
      TOKEN_NAME,
      TOKEN_SYMBOL,
    )) as ERC20Mintable;
    await erc20Mintable.deployed();

    const LondonGift = await ethers.getContractFactory('LondonGift');

    londonGift = (await LondonGift.deploy(
      name,
      symbol,
      erc20Mintable.address,
      mintPrice,
      maxSupply,
      provenance,
    )) as LondonGift;
    await londonGift.deployed();
  });

  describe('constructor', () => {
    it('should configure variables correctly', async function () {
      expect(await londonGift.name()).to.eq(name);
      expect(await londonGift.symbol()).to.eq(symbol);
      expect(await londonGift.payableErc20()).to.eq(erc20Mintable.address);
      expect(await londonGift.mintPrice()).to.eq(mintPrice);
      // expect(await londonGift.maxMintPerAddress()).to.eq(maxMintPerAddress);
      expect(await londonGift.maxSupply()).to.eq(maxSupply);
      expect(await londonGift.provenance()).to.eq(provenance);
    });
  });

  describe('setTreasury', () => {
    it('should set new treasury address', async function () {
      await londonGift.connect(owner).setTreasury(await treasury.getAddress());
      expect(await londonGift.treasury()).to.eq(await treasury.getAddress());
    });
    it('should not set new treasury address by rando', async function () {
      await expect(
        londonGift.connect(rando).setTreasury(await treasury.getAddress()),
      ).to.reverted;
    });
  });

  describe('setBaseMetadataURI', () => {
    it('should set new baseMetadataURI', async function () {
      await londonGift.connect(owner).setBaseMetadataURI(baseMetadataURI);
      expect(await londonGift.baseMetadataURI()).to.eq(baseMetadataURI);
    });
    it('should not set new baseMetadataURI by rando', async function () {
      await expect(
        londonGift.connect(rando).setBaseMetadataURI(baseMetadataURI),
      ).to.reverted;
    });
  });

  describe('setContractURI', () => {
    it('should set new baseMetadataURI', async function () {
      await londonGift.connect(owner).setContractURI(contractURI);
      expect(await londonGift.contractURI()).to.eq(contractURI);
    });
    it('should not set new baseMetadataURI by rando', async function () {
      await expect(londonGift.connect(rando).setContractURI(contractURI)).to
        .reverted;
    });
  });

  describe('setMintStartAtBlockNum', () => {
    it('should set new mintStartAtBlockNum', async function () {
      await londonGift
        .connect(owner)
        .setMintStartAtBlockNum(mintStartAtBlockNum);
      expect(await londonGift.mintStartAtBlockNum()).to.eq(mintStartAtBlockNum);
    });
    it('should not set new mintStartAtBlockNum by rando', async function () {
      await expect(
        londonGift.connect(rando).setMintStartAtBlockNum(mintStartAtBlockNum),
      ).to.reverted;
    });
  });

  describe('setRevealStartAtBlockNum', () => {
    it('should set new revealStartAtBlockNum', async function () {
      await londonGift
        .connect(owner)
        .setRevealStartAtBlockNum(revealStartAtBlockNum);
      expect(await londonGift.revealStartAtBlockNum()).to.eq(
        revealStartAtBlockNum,
      );
    });
    it('should not set new revealStartAtBlockNum by rando', async function () {
      await expect(
        londonGift
          .connect(rando)
          .setRevealStartAtBlockNum(revealStartAtBlockNum),
      ).to.reverted;
    });
  });

  describe('tokenURI', () => {
    beforeEach(async () => {
      await erc20Mintable
        .connect(minter)
        .mint(await rando.getAddress(), mintPrice.mul(maxMintPerAddress + 1));
      await erc20Mintable
        .connect(rando)
        .approve(londonGift.address, mintPrice.mul(maxMintPerAddress + 1));
      await londonGift.connect(owner).setTreasury(await treasury.getAddress());
      await londonGift
        .connect(owner)
        .setMintStartAtBlockNum(mintStartAtBlockNum);
      await londonGift
        .connect(owner)
        .setRevealStartAtBlockNum(revealStartAtBlockNum);
      await londonGift.connect(owner).setBaseMetadataURI(baseMetadataURI);
    });
    it('should return empty tokenURI if startingIndex not set', async function () {
      expect(await londonGift.startingIndex()).to.eq(BigNumber.from(0));
      await londonGift.connect(rando).mint(1);
      expect(await londonGift.tokenURI(0)).to.eq('');
    });
    it('should set starting index by last mint and return tokenURI', async function () {
      expect(await londonGift.startingIndex()).to.eq(BigNumber.from(0));
      await erc20Mintable
        .connect(minter)
        .mint(await owner.getAddress(), mintPrice.mul(100));
      await erc20Mintable
        .connect(owner)
        .approve(londonGift.address, mintPrice.mul(100));
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(owner).mint(15);
      const blockNumber = await ethers.provider.getBlockNumber();

      expect(blockNumber).to.be.lessThanOrEqual(revealStartAtBlockNum);
      expect(await londonGift.startingIndex()).to.not.eq(BigNumber.from(0));
      const startingIndex = await londonGift.startingIndex();
      expect(await londonGift.tokenURI(0)).to.eq(
        `${baseMetadataURI}${BigNumber.from(0)
          .add(startingIndex)
          .mod(maxSupply)
          .toString()}`,
      );
    });
    it('should set starting index by revealStartAtBlockNum', async function () {
      expect(await londonGift.startingIndex()).to.eq(BigNumber.from(0));
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      const blockNumber = await ethers.provider.getBlockNumber();
      await londonGift.connect(owner).setRevealStartAtBlockNum(blockNumber);
      expect(await londonGift.startingIndex()).to.not.eq(BigNumber.from(0));
      const startingIndex = await londonGift.startingIndex();
      expect(await londonGift.tokenURI(0)).to.eq(
        `${baseMetadataURI}${BigNumber.from(0)
          .add(startingIndex)
          .mod(maxSupply)
          .toString()}`,
      );
    });
  });

  describe('mint', () => {
    beforeEach(async () => {
      await erc20Mintable
        .connect(minter)
        .mint(await rando.getAddress(), mintPrice.mul(maxMintPerAddress + 1));
      await erc20Mintable
        .connect(rando)
        .approve(londonGift.address, mintPrice.mul(maxMintPerAddress + 1));
      await londonGift.connect(owner).setTreasury(await treasury.getAddress());
      await londonGift
        .connect(owner)
        .setMintStartAtBlockNum(mintStartAtBlockNum);
    });
    it('should transfer LONDON payment correctly', async function () {
      const beforeLondonBalance = await erc20Mintable.balanceOf(
        await rando.getAddress(),
      );
      await londonGift.connect(rando).mint(1);
      const afterLondonBalance = await erc20Mintable.balanceOf(
        await rando.getAddress(),
      );
      expect(beforeLondonBalance.sub(afterLondonBalance)).to.eq(mintPrice);
    });
    it('should transfer LONDON payment correctly when batched', async function () {
      const beforeLondonBalance = await erc20Mintable.balanceOf(
        await rando.getAddress(),
      );
      await londonGift.connect(rando).mint(4);
      const afterLondonBalance = await erc20Mintable.balanceOf(
        await rando.getAddress(),
      );
      expect(beforeLondonBalance.sub(afterLondonBalance)).to.eq(
        mintPrice.mul(4),
      );
    });
    it('should mint NFT in token index sequence', async function () {
      await londonGift.connect(rando).mint(1);
      expect(await londonGift.ownerOf(BigNumber.from('0'))).to.eq(
        await rando.getAddress(),
      );
      await londonGift.connect(rando).mint(1);
      expect(await londonGift.ownerOf(BigNumber.from('1'))).to.eq(
        await rando.getAddress(),
      );
      await londonGift.connect(rando).mint(2);
      expect(await londonGift.ownerOf(BigNumber.from('2'))).to.eq(
        await rando.getAddress(),
      );
      expect(await londonGift.ownerOf(BigNumber.from('3'))).to.eq(
        await rando.getAddress(),
      );
    });
    it('should not mint if not approved to move LONDON', async function () {
      await erc20Mintable
        .connect(rando)
        .approve(londonGift.address, mintPrice.mul(2).sub(1));
      await expect(londonGift.connect(rando).mint(2)).to.revertedWith(
        'Allowance not set to mint',
      );
    });

    it('should not mint if not enough balance of LONDON ', async function () {
      await erc20Mintable
        .connect(rando)
        .transfer(
          await owner.getAddress(),
          mintPrice.mul(maxMintPerAddress - 1).add(1),
        );
      await expect(londonGift.connect(rando).mint(2)).to.revertedWith(
        'Not enough token to mint',
      );
    });
    // it('should not mint if exceeds per balance limit', async function () {
    //   await londonGift.connect(rando).mint(1);
    //   await londonGift.connect(rando).mint(1);
    //   await londonGift.connect(rando).mint(1);
    //   await londonGift.connect(rando).mint(1);
    //   await londonGift.connect(rando).mint(1);
    //   await expect(londonGift.connect(rando).mint(1)).to.revertedWith(
    //     'Max supply per address minted',
    //   );
    // });
    it('should not mint if before mintStartAtBlockNum', async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      await londonGift.connect(owner).setMintStartAtBlockNum(blockNumber + 10);
      await expect(londonGift.connect(rando).mint(1)).to.revertedWith(
        'too early',
      );
    });
    it('should not mint if over max supply', async function () {
      await erc20Mintable
        .connect(minter)
        .mint(await owner.getAddress(), mintPrice.mul(100));
      await erc20Mintable
        .connect(owner)
        .approve(londonGift.address, mintPrice.mul(100));
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(rando).mint(1);
      await londonGift.connect(owner).mint(1);
      await expect(londonGift.connect(owner).mint(16)).to.revertedWith(
        'max supply minted',
      );
      await londonGift.connect(owner).mint(15);
      await expect(londonGift.connect(owner).mint(1)).to.revertedWith(
        'max supply minted',
      );
      await expect(londonGift.connect(owner).mint(2)).to.revertedWith(
        'max supply minted',
      );
    });
    it('should not mint over 20 per tx', async function () {
      await erc20Mintable
        .connect(minter)
        .mint(await owner.getAddress(), mintPrice.mul(maxMintPerAddress));
      await erc20Mintable.connect(owner).approve(londonGift.address, mintPrice);
      await expect(londonGift.connect(owner).mint(21)).to.revertedWith(
        'too many mints in one go',
      );
    });
  });
});
