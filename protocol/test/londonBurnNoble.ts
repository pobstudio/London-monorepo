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
const NOBLE_TYPE =
  '0x8000000000000000000000000000000100000000000000000000000000000000';

const ULTRASONIC_BLOCK = 15_000_000;

interface MintCheck {
  URI: string;
  to: string;
  signature: string;
}

describe('LondonBurnNoble', function () {
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
    minter = accounts[4];
    mintingAuthority = accounts[5];
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
      .mint(await minter.getAddress(), PRICE_PER_PRISTINE_MINT.mul(100));

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
    await londonBurn.setMintingAuthority(await mintingAuthority.getAddress());
  });

  describe('getAirdropHash', () => {
    it('should produce correct airdropHash', async function () {
      const to = await minter.getAddress();
      const nobility = 1;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropHashFromProtocol = await londonBurn.getAirdropHash(
        to,
        nobility,
      );
      expect(airdropHashFromProtocol).to.eq(airdropHash);
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

      expect(await londonBurn.verifyAirdrop(to, nobility, airdropSig)).to.eq(
        true,
      );
    });
  });

  describe('mintNobleType', () => {
    beforeEach(async () => {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
    });
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

      const mintCheck = await getMintChecks(to, 2);

      await londonBurn
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

      const mintCheck = await getMintChecks(to, 5);

      await londonBurn
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

      const mintCheck = await getMintChecks(to, 16);

      await londonBurn
        .connect(minter)
        .mintNobleType(nobility, airdropSig, mintCheck);

      expect(await londonBurn.tokenTypeSupply(NOBLE_TYPE)).to.eq(16);
    });
    it('should not mint if not revealed', async function () {
      await londonBurn
        .connect(owner)
        .setRevealBlockNumber(
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        );
      const to = await minter.getAddress();
      const nobility = 2;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );

      const mintCheck = await getMintChecks(to, 5);

      await expect(
        londonBurn
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('NOBLE has not been revealed yet');
    });
    it('should not mint if after ultrasonic block', async function () {
      await londonBurn.connect(owner).setUltraSonicForkBlockNumber(0);
      const to = await minter.getAddress();
      const nobility = 2;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );

      const mintCheck = await getMintChecks(to, 5);

      await expect(
        londonBurn
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint if after ultrasonic block', async function () {
      const to = await minter.getAddress();
      const nobility = 2;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = BAD_SIGNATURE;

      const mintCheck = await getMintChecks(to, 5);

      await expect(
        londonBurn
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('Noble mint is not valid');
    });
    it('should not mint if mintChecks not enough', async function () {
      const to = await minter.getAddress();
      const nobility = 3;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );

      const mintCheck = await getMintChecks(to, 15);

      await expect(
        londonBurn
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('MintChecks length mismatch');
    });
    it('should not mint if mintChecks too much', async function () {
      const to = await minter.getAddress();
      const nobility = 3;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );

      const mintCheck = await getMintChecks(to, 17);

      await expect(
        londonBurn
          .connect(minter)
          .mintNobleType(nobility, airdropSig, mintCheck),
      ).to.revertedWith('MintChecks length mismatch');
    });
    it('should not mint if already minted', async function () {
      const to = await minter.getAddress();
      const nobility = 3;

      const airdropHash = ethers.utils.solidityKeccak256(
        ['address', 'uint8'],
        [to, nobility],
      );

      const airdropSig = await mintingAuthority.signMessage(
        ethers.utils.arrayify(airdropHash),
      );

      const mintCheck = await getMintChecks(to, 32);

      const chunkedMintChecks = chunk(mintCheck, 16);

      await londonBurn
        .connect(minter)
        .mintNobleType(nobility, airdropSig, chunkedMintChecks[0]);

      expect(await londonBurn.tokenTypeSupply(NOBLE_TYPE)).to.eq(16);

      await expect(
        londonBurn
          .connect(minter)
          .mintNobleType(nobility, airdropSig, chunkedMintChecks[1]),
      ).to.revertedWith('Already received airdrop');
    });
  });
});
