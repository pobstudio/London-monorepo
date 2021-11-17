import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain/LondonBurn';
import { ERC20Mintable } from '../typechain/ERC20Mintable';
import { ERC721Mintable } from '../typechain/ERC721Mintable';
import { expect } from 'chai';
import { chunk } from 'lodash';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const PRICE_PER_PRISTINE_MINT = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
const MAX_PRISTINE_AMOUNT_PER_MINT = 4;
const PRISTINE_MINTABLE_SUPPLY = 500;

const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const PRISTINE_TYPE =
  '0x8000000000000000000000000000000300000000000000000000000000000000';

const ULTRASONIC_BLOCK = 15_000_000;

interface MintCheck {
  URI: string;
  to: string;
  signature: string;
}

describe('LondonBurnPristine', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let minter: Signer;
  let minter1: Signer;
  let erc20Mintable: ERC20Mintable;
  let erc721Mintable: ERC721Mintable;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    treasury = accounts[2];
    mintingAuthority = accounts[3];
    minter = accounts[4];
    minter1 = accounts[5];
  });

  const getMintChecks = async (to: string, num: number) => {
    const mintChecks: MintCheck[] = [];

    for (let i = 0; i < num; ++i) {
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck' + i,
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

    await erc20Mintable
      .connect(owner)
      .mint(await rando.getAddress(), PRICE_PER_PRISTINE_MINT.sub(1));
    await erc20Mintable
      .connect(owner)
      .mint(
        await minter.getAddress(),
        PRICE_PER_PRISTINE_MINT.mul(PRISTINE_MINTABLE_SUPPLY + 1),
      );
    await erc20Mintable
      .connect(owner)
      .mint(
        await minter1.getAddress(),
        PRICE_PER_PRISTINE_MINT.mul(PRISTINE_MINTABLE_SUPPLY + 1),
      );

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

  describe('mintPristineType', () => {
    it('should mint correctly', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
      );

      await londonBurn.connect(minter).mintPristineType(mintChecks);

      expect(await londonBurn.tokenTypeSupply(PRISTINE_TYPE)).to.eq(
        BigNumber.from(MAX_PRISTINE_AMOUNT_PER_MINT),
      );

      expect(
        await londonBurn.ownerOf(BigNumber.from(PRISTINE_TYPE).or('1')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(PRISTINE_TYPE).or('1')),
      ).to.eq(mintChecks[0].URI);

      expect(
        await londonBurn.ownerOf(BigNumber.from(PRISTINE_TYPE).or('4')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(PRISTINE_TYPE).or('4')),
      ).to.eq(mintChecks[3].URI);

      expect(await erc20Mintable.balanceOf(await treasury.getAddress())).to.eq(
        PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
      );
    });
    it('should not mint if not enough balance', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(rando)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        1,
      );

      await expect(
        londonBurn.connect(rando).mintPristineType(mintChecks),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
    it('should not mint before revealBlockNumber', async function () {
      await londonBurn.connect(owner).setUltraSonicForkBlockNumber(1);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
      );

      await expect(
        londonBurn.connect(minter).mintPristineType(mintChecks),
      ).to.revertedWith('PRISTINE has not been revealed yet');
    });
    it('should not mint after ultraSonicForkBlockNumber', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setUltraSonicForkBlockNumber(1);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
      );

      await expect(
        londonBurn.connect(minter).mintPristineType(mintChecks),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint more than MAX_PRISTINE_AMOUNT_PER_MINT per mint', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT + 1),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT + 1,
      );

      await expect(
        londonBurn.connect(minter).mintPristineType(mintChecks),
      ).to.revertedWith('Exceeded per tx mint amount');
    });
    it('should not mint more consecutively', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT).mul(2),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT * 2,
      );
      const chunkedMintChecks: MintCheck[][] = chunk(
        mintChecks,
        MAX_PRISTINE_AMOUNT_PER_MINT,
      );
      await londonBurn.connect(minter).mintPristineType(chunkedMintChecks[0]);
      await expect(
        londonBurn.connect(minter).mintPristineType(chunkedMintChecks[1]),
      ).to.revertedWith("Can't mint consecutively");
    });
    it('should not mint if exceeded mintable supply', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(PRISTINE_MINTABLE_SUPPLY + 1),
        );
      await erc20Mintable
        .connect(minter1)
        .approve(
          londonBurn.address,
          PRICE_PER_PRISTINE_MINT.mul(PRISTINE_MINTABLE_SUPPLY + 1),
        );

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        PRISTINE_MINTABLE_SUPPLY,
      );

      const groupedMintChecks = chunk(mintChecks, 4);

      let i = 0;
      for (const gmc of groupedMintChecks) {
        if (i % 2 == 0) {
          await londonBurn.connect(minter).mintPristineType(gmc);
        } else {
          await londonBurn.connect(minter1).mintPristineType(gmc);
        }
        i++;
      }

      await expect(await londonBurn.tokenTypeSupply(PRISTINE_TYPE)).to.eq(
        BigNumber.from(PRISTINE_MINTABLE_SUPPLY),
      );

      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await treasury.getAddress(),
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
      await expect(
        londonBurn.connect(treasury).mintPristineType([mintCheck]),
      ).to.revertedWith('Exceeded PRISTINE mint amount');
    });
  });
});
