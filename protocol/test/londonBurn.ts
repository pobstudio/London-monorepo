import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { expect } from 'chai';
import { min } from 'lodash';
import { newArray } from './utils';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const ETERNAL_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';
const INVALID_TYPE =
  '0x8000000000000000000000000000000100000000000000000000000000000000';
const ULTRASONIC_BLOCK = 15_000_000;

const CONTRACT_URI = '`ipfs://contracturi';

interface MintCheck {
  uris: string[];
  to: string;
  tokenType: string;
  signature: string;
}

interface ModifyCheck {
  uris: string[];
  tokenIds: BigNumber[];
  signature: string;
}

describe('LondonBurn', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let minter: Signer;
  let erc20Mintable: ERC20Mintable;
  let erc721Mintable: ERC721Mintable;
  let mintCheckCounter = 12;
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
  });

  describe('setContractURI', () => {
    it('should set new mintingAuthority address', async function () {
      await londonBurn.connect(owner).setContractURI(CONTRACT_URI);
      expect(await londonBurn.contractURI()).to.eq(CONTRACT_URI);
    });
    it('should not set new mintingAuthority address by rando', async function () {
      await expect(londonBurn.connect(rando).setContractURI(CONTRACT_URI)).to
        .reverted;
    });
  });

  describe('setMintingAuthority', () => {
    it('should set new mintingAuthority address', async function () {
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      expect(await londonBurn.mintingAuthority()).to.eq(
        await mintingAuthority.getAddress(),
      );
    });
    it('should not set new mintingAuthority address by rando', async function () {
      await expect(
        londonBurn
          .connect(rando)
          .setMintingAuthority(await mintingAuthority.getAddress()),
      ).to.reverted;
    });
  });

  describe('setMinter', () => {
    it('should set new minter address', async function () {
      await londonBurn.connect(owner).setMinter(await minter.getAddress());
      expect(await londonBurn.minter()).to.eq(await minter.getAddress());
    });
    it('should not set new minter address by rando', async function () {
      await expect(
        londonBurn.connect(rando).setMinter(await minter.getAddress()),
      ).to.reverted;
    });
  });

  describe('getMintCheckHash', () => {
    it('should produce correct hash', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        1,
        ETERNAL_TYPE,
      );
      const mintCheckHash = ethers.utils.solidityKeccak256(
        [
          'address',
          'uint256',
          ...newArray(mintCheck.uris.length).map((_) => 'string'),
        ],
        [mintCheck.to, mintCheck.tokenType, ...mintCheck.uris],
      );
      expect(await londonBurn.getMintCheckHash(mintCheck)).to.eq(mintCheckHash);
    });
  });
  describe('verifyMintCheck', () => {
    it('should produce correct hash', async function () {
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        4,
        ETERNAL_TYPE,
      );
      expect(await londonBurn.verifyMintCheck(mintCheck)).to.eq(true);
    });
  });

  describe('mintTokenType', () => {
    beforeEach(async () => {
      await londonBurn.connect(owner).setMinter(await minter.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      await londonBurn.connect(owner).setBaseMetadataURI('ipfs://');
    });

    it('should mint correctly with valid mintCheck', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        15,
        ETERNAL_TYPE,
      );
      await londonBurn.connect(minter).mintTokenType(mintCheck);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(`ipfs://${mintCheck.uris[0]}`);
      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(`ipfs://${mintCheck.uris[1]}`);
    });

    it('should not mint correctly with invalid mintCheck', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        15,
        ETERNAL_TYPE,
      );
      mintCheck.signature = BAD_SIGNATURE;
      await expect(
        londonBurn.connect(minter).mintTokenType(mintCheck),
      ).to.revertedWith('Mint check is not valid');
    });
    it('should not mint correctly with used mintCheck', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        15,
        ETERNAL_TYPE,
      );
      await londonBurn.connect(minter).mintTokenType(mintCheck);
      await expect(
        londonBurn.connect(minter).mintTokenType(mintCheck),
      ).to.revertedWith('Mint check has already been used');
    });
    it('should not mint correctly if rando', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        15,
        ETERNAL_TYPE,
      );

      await expect(
        londonBurn.connect(rando).mintTokenType(mintCheck),
      ).to.revertedWith('Caller is not the minter');
    });
  });

  describe('getModifyCheckHash', () => {
    it('should produce correct hash', async function () {
      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://mintcheck'],
        tokenIds: [BigNumber.from(1)],
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        [
          ...newArray(modifyCheck.uris.length).map((_) => 'uint256'),
          ...newArray(modifyCheck.tokenIds.length).map((_) => 'string'),
        ],
        [...modifyCheck.tokenIds, ...modifyCheck.uris],
      );

      expect(await londonBurn.getModifyCheckHash(modifyCheck)).to.eq(
        modifyCheckHash,
      );
    });
  });

  describe('verifyModifyCheck', () => {
    it('should produce correct hash', async function () {
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://mintcheck'],
        tokenIds: [BigNumber.from(1)],
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        [
          ...newArray(modifyCheck.uris.length).map((_) => 'uint256'),
          ...newArray(modifyCheck.tokenIds.length).map((_) => 'string'),
        ],
        [...modifyCheck.tokenIds, ...modifyCheck.uris],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      expect(await londonBurn.verifyModifyCheck(modifyCheck)).to.eq(true);
    });
  });

  describe('modifyBaseURIByModifyCheck', () => {
    beforeEach(async () => {
      await londonBurn.connect(owner).setMinter(await minter.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        4,
        ETERNAL_TYPE,
      );

      await londonBurn.connect(minter).mintTokenType(mintCheck);
    });
    it('should correctly modify token id base URI', async function () {
      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://modifycheck1', 'ipfs://modifycheck2'],
        tokenIds: [
          BigNumber.from(ETERNAL_TYPE).or('1'),
          BigNumber.from(ETERNAL_TYPE).or('2'),
        ],
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        [
          ...newArray(modifyCheck.uris.length).map((_) => 'uint256'),
          ...newArray(modifyCheck.tokenIds.length).map((_) => 'string'),
        ],
        [...modifyCheck.tokenIds, ...modifyCheck.uris],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await londonBurn.modifyBaseURIByModifyCheck(modifyCheck);

      expect(await londonBurn.tokenURI(modifyCheck.tokenIds[0])).to.eq(
        modifyCheck.uris[0],
      );
      expect(await londonBurn.tokenURI(modifyCheck.tokenIds[1])).to.eq(
        modifyCheck.uris[1],
      );
    });
    it('should not modify token id base URI if not valid check', async function () {
      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://modifycheck1', 'ipfs://modifycheck2'],
        tokenIds: [
          BigNumber.from(ETERNAL_TYPE).or('1'),
          BigNumber.from(ETERNAL_TYPE).or('2'),
        ],
        signature: BAD_SIGNATURE,
      };
      await expect(
        londonBurn.modifyBaseURIByModifyCheck(modifyCheck),
      ).to.revertedWith('Modify check is not valid');
    });
    it('should not modify token id base URI if already used', async function () {
      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://modifycheck1', 'ipfs://modifycheck2'],
        tokenIds: [
          BigNumber.from(ETERNAL_TYPE).or('1'),
          BigNumber.from(ETERNAL_TYPE).or('2'),
        ],
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        [
          ...newArray(modifyCheck.uris.length).map((_) => 'uint256'),
          ...newArray(modifyCheck.tokenIds.length).map((_) => 'string'),
        ],
        [...modifyCheck.tokenIds, ...modifyCheck.uris],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await londonBurn.modifyBaseURIByModifyCheck(modifyCheck);
      await expect(
        londonBurn.connect(minter).modifyBaseURIByModifyCheck(modifyCheck),
      ).to.revertedWith('Modify check has already been used');
    });
    it('should not modify token id does not exist', async function () {
      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://modifycheck5'],
        tokenIds: [BigNumber.from(ETERNAL_TYPE).or('5')],
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        [
          ...newArray(modifyCheck.uris.length).map((_) => 'uint256'),
          ...newArray(modifyCheck.tokenIds.length).map((_) => 'string'),
        ],
        [...modifyCheck.tokenIds, ...modifyCheck.uris],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await expect(
        londonBurn.modifyBaseURIByModifyCheck(modifyCheck),
      ).to.revertedWith('Tokenid does not exist');
    });

    it('should not modify token id if incorrectly shapped modify Check', async function () {
      const modifyCheck: ModifyCheck = {
        uris: ['ipfs://modifycheck1'],
        tokenIds: [
          BigNumber.from(ETERNAL_TYPE).or('1'),
          BigNumber.from(ETERNAL_TYPE).or('2'),
        ],
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        [
          ...newArray(modifyCheck.uris.length).map((_) => 'uint256'),
          ...newArray(modifyCheck.tokenIds.length).map((_) => 'string'),
        ],
        [...modifyCheck.tokenIds, ...modifyCheck.uris],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await expect(
        londonBurn.modifyBaseURIByModifyCheck(modifyCheck),
      ).to.revertedWith('tokenIds mismatch with uris');
    });
  });
});
