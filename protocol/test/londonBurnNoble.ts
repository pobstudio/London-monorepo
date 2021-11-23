import { ethers, network } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { expect } from 'chai';
import { chunk } from 'lodash';
import { deployments } from '../deployments';
import { newArray } from './utils';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const PRICE_PER_PRISTINE_MINT = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
const MAX_PRISTINE_AMOUNT_PER_MINT = 4;
const PRISTINE_MINTABLE_SUPPLY = 500;
const MAX_BLOCK_NUM =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const NOBLE_TYPE =
  '0x8000000000000000000000000000000100000000000000000000000000000000';

const ULTRASONIC_BLOCK = 15_000_000;
const TEAM_ADDRESS = '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4';

interface MintCheck {
  uris: string[];
  to: string;
  tokenType: string;
  signature: string;
}

describe('LondonBurnNoble', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let londonBurnMinter: LondonBurnMinter;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let airdropAuthority: Signer;
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
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [TEAM_ADDRESS],
    });
    minter = await ethers.getSigner(TEAM_ADDRESS);
    airdropAuthority = mintingAuthority;
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

  describe('getAirdropHash', () => {
    it('should produce correct airdropHash', async function () {
      const to = await minter.getAddress();
      const nobility = 1;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropHashFromProtocol = await londonBurnMinter.getAirdropHash(
        to,
        nobility,
      );
      expect(airdropHashFromProtocol).to.eq(airdropHash);
    });
  });

  describe('setAirdropAuthority', () => {
    it('should set new airdropAuthority address', async function () {
      await londonBurnMinter
        .connect(owner)
        .setAirdropAuthority(await airdropAuthority.getAddress());
      expect(await londonBurnMinter.airdropAuthority()).to.eq(
        await airdropAuthority.getAddress(),
      );
    });
    it('should not set new mintingAuthority address by rando', async function () {
      await expect(
        londonBurnMinter
          .connect(rando)
          .setAirdropAuthority(await airdropAuthority.getAddress()),
      ).to.reverted;
    });
  });

  describe('verifyAirdrop', () => {
    it('should correctly verify signature of wallet', async function () {
      const to = await minter.getAddress();
      const nobility = 1;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );

      expect(
        await londonBurnMinter.verifyAirdrop(to, nobility, airdropSig),
      ).to.eq(true);
    });
  });

  describe('mintNobleType', () => {
    it('should mint correctly (Baron)', async function () {
      const to = await minter.getAddress();
      const nobility = 1;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck = await getMintCheck(to, 2, NOBLE_TYPE);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck);
      expect(await londonBurn.tokenTypeSupply(NOBLE_TYPE)).to.eq(2);
    });
    it('should mint correctly (Earl)', async function () {
      const to = await minter.getAddress();
      const nobility = 2;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck = await getMintCheck(to, 5, NOBLE_TYPE);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck);
      expect(await londonBurn.tokenTypeSupply(NOBLE_TYPE)).to.eq(5);
    });
    it('should mint correctly (Duke)', async function () {
      const to = await minter.getAddress();
      const nobility = 3;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck = await getMintCheck(to, 16, NOBLE_TYPE);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck);
      expect(await londonBurn.tokenTypeSupply(NOBLE_TYPE)).to.eq(16);
    });
    it('should not mint if not revealed', async function () {
      await londonBurnMinter.connect(owner).setRevealBlockNumber(MAX_BLOCK_NUM);
      const to = await minter.getAddress();
      const nobility = 2;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck = await getMintCheck(to, 5, NOBLE_TYPE);
      await expect(
        londonBurnMinter
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('NOBLE has not been revealed yet');
    });
    it('should not mint if after ultrasonic block', async function () {
      await londonBurnMinter.connect(owner).setUltraSonicForkBlockNumber(0);
      const to = await minter.getAddress();
      const nobility = 2;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck = await getMintCheck(to, 5, NOBLE_TYPE);
      await expect(
        londonBurnMinter
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint if bad checks', async function () {
      const to = await minter.getAddress();
      const nobility = 2;
      const airdropSig = BAD_SIGNATURE;
      const mintCheck = await getMintCheck(to, 5, NOBLE_TYPE);
      await expect(
        londonBurnMinter
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('Noble mint is not valid');
    });
    it('should mint many times up to airdrop', async function () {
      const to = await minter.getAddress();
      const nobility = 3;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck1 = await getMintCheck(to, 4, NOBLE_TYPE);
      const mintCheck2 = await getMintCheck(to, 4, NOBLE_TYPE);
      const mintCheck3 = await getMintCheck(to, 4, NOBLE_TYPE);
      const mintCheck4 = await getMintCheck(to, 4, NOBLE_TYPE);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck1);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck2);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck3);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck4);
      expect(await londonBurn.tokenTypeSupply(NOBLE_TYPE)).to.eq(16);
    });
    it('should not mint if exceeds alloted amount in one txn', async function () {
      const to = await minter.getAddress();
      const nobility = 3;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck = await getMintCheck(to, 17, NOBLE_TYPE);
      await expect(
        londonBurnMinter
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('MintChecks length mismatch');
    });
    it('should not mint if exceeds alloted amount in two txn', async function () {
      const to = await minter.getAddress();
      const nobility = 3;
      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );
      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );
      const mintCheck1 = await getMintCheck(to, 10, NOBLE_TYPE);
      const mintCheck2 = await getMintCheck(to, 7, NOBLE_TYPE);
      await londonBurnMinter
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck1);
      await expect(
        londonBurnMinter
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck2),
      ).to.revertedWith('Already received airdrop');
    });
  });
});
