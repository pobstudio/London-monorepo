import { ethers, network } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import { expect } from 'chai';
import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { deployments } from '../deployments';
import { chunk } from 'lodash';
import { newArray } from './utils';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const ETERNAL_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';
const MAX_BLOCK_NUM =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const ULTRASONIC_BLOCK = 15_000_000;
const TEAM_ADDRESS = '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4';

interface MintCheck {
  uris: string[];
  to: string;
  tokenType: string;
  signature: string;
}

describe('LondonBurnEternal', function () {
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
      deployments[1].erc20,
      deployments[1].gift,
      deployments[1].sushiswap,
    )) as LondonBurnMinter;
    await londonBurnMinter.deployed();
    await londonBurn.setMinter(londonBurnMinter.address);
  });

  describe('mintEternalType', () => {
    beforeEach(async () => {
      await londonBurnMinter.connect(owner).setRevealBlockNumber(0);
      await londonBurnMinter
        .connect(owner)
        .setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
    });
    it('should mint correctly', async function () {
      const mintCheck = await getMintCheck(
        await treasury.getAddress(),
        2,
        ETERNAL_TYPE,
      );

      await londonBurnMinter.connect(minter).mintEternalType(mintCheck);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(await treasury.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(mintCheck.uris[0]);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(await treasury.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(mintCheck.uris[1]);
    });
    it('should not mint if not revealed', async function () {
      await londonBurnMinter.connect(owner).setRevealBlockNumber(MAX_BLOCK_NUM);

      const mintCheck = await getMintCheck(
        await treasury.getAddress(),
        2,
        ETERNAL_TYPE,
      );

      await expect(
        londonBurnMinter.connect(treasury).mintEternalType(mintCheck),
      ).to.revertedWith('ETERNAL has not been revealed yet');
    });
    it('should not mint if check not directed to treasury', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        2,
        ETERNAL_TYPE,
      );

      await expect(
        londonBurnMinter.connect(minter).mintEternalType(mintCheck),
      ).to.revertedWith('MintCheck do not mint to treasury');
    });
    it('should not mint if ultrasonic mode', async function () {
      await londonBurnMinter.connect(owner).setUltraSonicForkBlockNumber(1);

      const mintCheck = await getMintCheck(
        await treasury.getAddress(),
        2,
        ETERNAL_TYPE,
      );

      await expect(
        londonBurnMinter.connect(minter).mintEternalType(mintCheck),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint if exceeded mintable supply', async function () {
      const mintChecks = [
        await getMintCheck(await treasury.getAddress(), 25, ETERNAL_TYPE),
        await getMintCheck(await treasury.getAddress(), 25, ETERNAL_TYPE),
        await getMintCheck(await treasury.getAddress(), 25, ETERNAL_TYPE),
        await getMintCheck(await treasury.getAddress(), 25, ETERNAL_TYPE),
      ];

      for (const mc of mintChecks) {
        await londonBurnMinter.connect(treasury).mintEternalType(mc);
      }

      await expect(await londonBurn.tokenTypeSupply(ETERNAL_TYPE)).to.eq(
        BigNumber.from(100),
      );

      const newMintCheck = await getMintCheck(
        await treasury.getAddress(),
        1,
        ETERNAL_TYPE,
      );

      await expect(
        londonBurnMinter.connect(treasury).mintEternalType(newMintCheck),
      ).to.revertedWith('Exceeded ETERNAL mint amount');
    });
  });
});
