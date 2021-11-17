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

const ULTRASONIC_BLOCK = 15_000_000;

interface MintCheck {
  URI: string;
  to: string;
  signature: string;
}

describe('LondonBurnEternal', function () {
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

  describe('mintEternalType', () => {
    it('should mint correctly', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

      const mintChecks: MintCheck[] = [];

      for (let i = 0; i < 2; ++i) {
        const mintCheck: MintCheck = {
          URI: 'ipfs://mintcheck' + i,
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
        mintChecks.push(mintCheck);
      }

      await londonBurn.connect(treasury).mintEternalType(mintChecks);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(await treasury.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(mintChecks[0].URI);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(await treasury.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(mintChecks[1].URI);
    });
    it('should not mint if not valid mint check', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await treasury.getAddress(),
        signature: BAD_SIGNATURE,
      };

      await expect(
        londonBurn.connect(treasury).mintEternalType([mintCheck]),
      ).to.revertedWith('Mint check is not valid');
    });
    it('should not mint if already used check', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

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
        londonBurn.connect(treasury).mintEternalType([mintCheck, mintCheck]),
      ).to.revertedWith('Mint check has already been used');
      await londonBurn.connect(treasury).mintEternalType([mintCheck]);
      await expect(
        londonBurn.connect(treasury).mintEternalType([mintCheck]),
      ).to.revertedWith('Mint check has already been used');
    });
    it('should not mint if not revealed', async function () {
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

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
        londonBurn.connect(treasury).mintEternalType([mintCheck]),
      ).to.revertedWith('ETERNAL has not been revealed yet');
    });
    it('should not mint if not treasury', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

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
        londonBurn.connect(rando).mintEternalType([mintCheck]),
      ).to.revertedWith('Only treasury can mint');
    });
    it('should not mint if ultrasonic mode', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setUltraSonicForkBlockNumber(1);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

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
        londonBurn.connect(treasury).mintEternalType([mintCheck]),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint if exceeded mintable supply', async function () {
      await londonBurn.connect(owner).setRevealBlockNumber(0);
      await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

      const mintChecks: MintCheck[] = [];

      for (let i = 0; i < 100; ++i) {
        const mintCheck: MintCheck = {
          URI: 'ipfs://mintcheck' + i,
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
        mintChecks.push(mintCheck);
      }
      const groupedMintChecks = chunk(mintChecks, 20);

      for (const gmc of groupedMintChecks) {
        await londonBurn.connect(treasury).mintEternalType(gmc);
      }

      await expect(await londonBurn.tokenTypeSupply(ETERNAL_TYPE)).to.eq(
        BigNumber.from(100),
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
        londonBurn.connect(treasury).mintEternalType([mintCheck]),
      ).to.revertedWith('Exceeded ETERNAL mint amount');
    });
  });
});
