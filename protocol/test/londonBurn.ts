import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { expect } from 'chai';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const ETERNAL_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';

const ULTRASONIC_BLOCK = 15_000_000;

const CONTRACT_URI = '`ipfs://contracturi';

interface MintCheck {
  URI: string;
  to: string;
  signature: string;
}

interface ModifyCheck {
  URI: string;
  tokenId: BigNumber;
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
  let mintCheckCounter = 0;
  const getMintChecks = async (to: string, num: number) => {
    const mintChecks: MintCheck[] = [];

    for (let i = 0; i < num; ++i) {
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck' + mintCheckCounter + i,
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
    mintCheckCounter += num;
    return mintChecks;
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
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await minter.getAddress(),
        signature: BAD_SIGNATURE,
      };

      const mintCheckHash = ethers.utils.solidityKeccak256(
        ['address', 'string'],
        [mintCheck.to, mintCheck.URI],
      );

      expect(await londonBurn.getMintCheckHash(mintCheck)).to.eq(mintCheckHash);
    });
  });

  describe('verifyMintCheck', () => {
    it('should produce correct hash', async function () {
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());

      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await minter.getAddress(),
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

      expect(await londonBurn.verifyMintCheck(mintCheck)).to.eq(true);
    });
  });

  describe('mintTokenType', () => {
    beforeEach(async () => {
      await londonBurn.connect(owner).setMinter(await minter.getAddress());
      await londonBurn
        .connect(owner)
        .setMintingAuthority(await mintingAuthority.getAddress());
    });

    it('should mint correctly with valid mintCheck', async function () {
      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        2,
      );

      await londonBurn.connect(minter).mintTokenType(ETERNAL_TYPE, mintChecks);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('1')),
      ).to.eq(mintChecks[0].URI);

      expect(
        await londonBurn.ownerOf(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(ETERNAL_TYPE).or('2')),
      ).to.eq(mintChecks[1].URI);
    });

    it('should not mint correctly with invalid mintCheck', async function () {
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await treasury.getAddress(),
        signature: BAD_SIGNATURE,
      };

      await expect(
        londonBurn.connect(minter).mintTokenType(ETERNAL_TYPE, [mintCheck]),
      ).to.revertedWith('Mint check is not valid');
    });
    it('should not mint correctly with used mintCheck', async function () {
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
        londonBurn
          .connect(minter)
          .mintTokenType(ETERNAL_TYPE, [mintCheck, mintCheck]),
      ).to.revertedWith('Mint check has already been used');
      await londonBurn.connect(minter).mintTokenType(ETERNAL_TYPE, [mintCheck]);
      await expect(
        londonBurn.connect(minter).mintTokenType(ETERNAL_TYPE, [mintCheck]),
      ).to.revertedWith('Mint check has already been used');
    });
    it('should not mint correctly with rando', async function () {
      const mintCheck: MintCheck = {
        URI: 'ipfs://mintcheck',
        to: await treasury.getAddress(),
        signature: BAD_SIGNATURE,
      };

      await expect(
        londonBurn.connect(treasury).mintTokenType(ETERNAL_TYPE, [mintCheck]),
      ).to.revertedWith('Caller is not the minter');
    });
  });

  describe('getModifyCheckHash', () => {
    it('should produce correct hash', async function () {
      const modifyCheck: ModifyCheck = {
        URI: 'ipfs://mintcheck',
        tokenId: BigNumber.from(1),
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        ['uint256', 'string'],
        [modifyCheck.tokenId, modifyCheck.URI],
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
        URI: 'ipfs://mintcheck',
        tokenId: BigNumber.from(1),
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        ['uint256', 'string'],
        [modifyCheck.tokenId, modifyCheck.URI],
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
      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        2,
      );

      await londonBurn.connect(minter).mintTokenType(ETERNAL_TYPE, mintChecks);
    });
    it('should correctly modify token id base URI', async function () {
      const modifyCheck: ModifyCheck = {
        URI: 'ipfs://modified',
        tokenId: BigNumber.from(ETERNAL_TYPE).or('1'),
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        ['uint256', 'string'],
        [modifyCheck.tokenId, modifyCheck.URI],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await londonBurn.modifyBaseURIByModifyCheck([modifyCheck]);

      expect(await londonBurn.tokenURI(modifyCheck.tokenId)).to.eq(
        modifyCheck.URI,
      );
    });
    it('should not modify token id base URI if not valid check', async function () {
      const modifyCheck: ModifyCheck = {
        URI: 'ipfs://modified',
        tokenId: BigNumber.from(ETERNAL_TYPE).or('1'),
        signature: BAD_SIGNATURE,
      };
      await expect(
        londonBurn.modifyBaseURIByModifyCheck([modifyCheck]),
      ).to.revertedWith('Modify check is not valid');
    });
    it('should not modify token id base URI if already used', async function () {
      const modifyCheck: ModifyCheck = {
        URI: 'ipfs://modified',
        tokenId: BigNumber.from(ETERNAL_TYPE).or('1'),
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        ['uint256', 'string'],
        [modifyCheck.tokenId, modifyCheck.URI],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await expect(
        londonBurn.modifyBaseURIByModifyCheck([modifyCheck, modifyCheck]),
      ).to.revertedWith('Modify check has already been used');
      await londonBurn.modifyBaseURIByModifyCheck([modifyCheck]);
      await expect(
        londonBurn.connect(minter).modifyBaseURIByModifyCheck([modifyCheck]),
      ).to.revertedWith('Modify check has already been used');
    });
    it('should not modify token id does not exist', async function () {
      const modifyCheck: ModifyCheck = {
        URI: 'ipfs://modified',
        tokenId: BigNumber.from(ETERNAL_TYPE).or('3'),
        signature: BAD_SIGNATURE,
      };

      const modifyCheckHash = ethers.utils.solidityKeccak256(
        ['uint256', 'string'],
        [modifyCheck.tokenId, modifyCheck.URI],
      );

      const bytesModifyCheckHash = ethers.utils.arrayify(modifyCheckHash);

      const modifyCheckHashSig = await mintingAuthority.signMessage(
        bytesModifyCheckHash,
      );

      modifyCheck.signature = modifyCheckHashSig;

      await expect(
        londonBurn.modifyBaseURIByModifyCheck([modifyCheck, modifyCheck]),
      ).to.revertedWith('Tokenid does not exist');
    });
  });
});
