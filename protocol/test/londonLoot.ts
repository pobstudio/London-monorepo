import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonLoot } from '../typechain/LondonLoot';
import { ERC721Mintable } from '../typechain/ERC721Mintable';
import { expect } from 'chai';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');

describe('LondonLoot', function () {
  // constant values used in transfer tests
  let londonLoot: LondonLoot;
  let nft: ERC721Mintable;
  let owner: Signer;
  let rando: Signer;
  let minter: Signer;

  const name = '$LONDON Gift';
  const symbol = 'GIFT';

  const mintPrice = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
  const maxMintPerAddress = 8;
  const maxSupply = 21;
  const prefixSequenceValue = 10;
  const provenance =
    '0xcc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf';

  const baseMetadataURI = 'ipfs://test/';
  const contractURI = 'ipfs://contract/';
  const mintStartAtBlockNum = 1;
  const unlockStartAtBlockNum = 1;

  const revealStartAtBlockNum = 1000;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    minter = accounts[2];
  });

  beforeEach(async function () {
    const ERC721Mintable = await ethers.getContractFactory('ERC721Mintable');
    nft = (await ERC721Mintable.deploy('TEST', 'TEST')) as ERC721Mintable;
    await nft.deployed();

    const LondonLoot = await ethers.getContractFactory('LondonLoot');

    londonLoot = (await LondonLoot.deploy(
      name,
      symbol,
      nft.address,
      provenance,
    )) as LondonLoot;
    await londonLoot.deployed();
  });

  describe('constructor', () => {
    it('should configure variables correctly', async function () {
      expect(await londonLoot.londonGift()).to.eq(nft.address);
      expect(await londonLoot.provenance()).to.eq(provenance);
    });
  });

  describe('setBaseMetadataURI', () => {
    it('should set new baseMetadataURI', async function () {
      await londonLoot.connect(owner).setBaseMetadataURI(baseMetadataURI);
      expect(await londonLoot.baseMetadataURI()).to.eq(baseMetadataURI);
    });
    it('should not set new baseMetadataURI by rando', async function () {
      await expect(
        londonLoot.connect(rando).setBaseMetadataURI(baseMetadataURI),
      ).to.reverted;
    });
  });

  describe('setContractURI', () => {
    it('should set new baseMetadataURI', async function () {
      await londonLoot.connect(owner).setContractURI(contractURI);
      expect(await londonLoot.contractURI()).to.eq(contractURI);
    });
    it('should not set new baseMetadataURI by rando', async function () {
      await expect(londonLoot.connect(rando).setContractURI(contractURI)).to
        .reverted;
    });
  });

  describe('mint', () => {
    beforeEach(async () => {
      await nft.mint(); // 0
      await nft.mint(); // 1
      await nft.mint(); // 2
      await nft.mint(); // 3
      await nft.connect(rando).mint(); // 4
      await londonLoot.connect(owner).setBaseMetadataURI(baseMetadataURI);
    });
    it('should mint NFT with same token index', async function () {
      await londonLoot.connect(owner).mint([0, 1, 3, 2]);
      expect(await londonLoot.ownerOf(BigNumber.from('0'))).to.eq(
        await owner.getAddress(),
      );
      expect(await londonLoot.tokenURI(BigNumber.from('0'))).to.eq(
        `${baseMetadataURI}${0}`,
      );
      expect(await londonLoot.ownerOf(BigNumber.from('1'))).to.eq(
        await owner.getAddress(),
      );
      expect(await londonLoot.ownerOf(BigNumber.from('3'))).to.eq(
        await owner.getAddress(),
      );
      expect(await londonLoot.ownerOf(BigNumber.from('2'))).to.eq(
        await owner.getAddress(),
      );
      await londonLoot.connect(rando).mint([4]);
      expect(await londonLoot.ownerOf(BigNumber.from('4'))).to.eq(
        await rando.getAddress(),
      );
    });
    it('should not mint if already minted', async function () {
      await londonLoot.connect(owner).mint([0, 1]);
      await expect(londonLoot.connect(owner).mint([0])).to.revertedWith(
        'ERC721: token already minted',
      );
      await expect(londonLoot.connect(owner).mint([2, 2])).to.revertedWith(
        'ERC721: token already minted',
      );
    });

    it('should not mint if not owner', async function () {
      await expect(londonLoot.connect(owner).mint([4])).to.revertedWith(
        'Do not own $LONDON GIFT',
      );
      await expect(londonLoot.connect(rando).mint([0, 2])).to.revertedWith(
        'Do not own $LONDON GIFT',
      );
    });
  });
});
