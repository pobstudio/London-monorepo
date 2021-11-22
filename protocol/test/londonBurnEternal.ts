import { ethers, network } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import { expect } from 'chai';
import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { deployments } from '../deployments';
import { chunk } from 'lodash';

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
  URI: string;
  to: string;
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
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: ['0x364d6D0333432C3Ac016Ca832fb8594A8cE43Ca6'],
    });
    minter = await ethers.getSigner(TEAM_ADDRESS);
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
      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        2,
      );

      await londonBurnMinter.connect(treasury).mintEternalType(mintChecks);

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
    it('should not mint if not revealed', async function () {
      await londonBurnMinter.connect(owner).setRevealBlockNumber(MAX_BLOCK_NUM);

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        2,
      );

      await expect(
        londonBurnMinter.connect(treasury).mintEternalType(mintChecks),
      ).to.revertedWith('ETERNAL has not been revealed yet');
    });
    it('should not mint if not treasury', async function () {
      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        2,
      );

      await expect(
        londonBurnMinter.connect(rando).mintEternalType(mintChecks),
      ).to.revertedWith('Only treasury can mint');
    });
    it('should not mint if ultrasonic mode', async function () {
      await londonBurnMinter.connect(owner).setUltraSonicForkBlockNumber(1);

      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        2,
      );

      await expect(
        londonBurnMinter.connect(treasury).mintEternalType(mintChecks),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint if exceeded mintable supply', async function () {
      const mintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        100,
      );

      const groupedMintChecks = chunk(mintChecks, 20);

      for (const gmc of groupedMintChecks) {
        await londonBurnMinter.connect(treasury).mintEternalType(gmc);
      }

      await expect(await londonBurn.tokenTypeSupply(ETERNAL_TYPE)).to.eq(
        BigNumber.from(100),
      );

      const newMintChecks: MintCheck[] = await getMintChecks(
        await minter.getAddress(),
        1,
      );

      await expect(
        londonBurnMinter.connect(treasury).mintEternalType(newMintChecks),
      ).to.revertedWith('Exceeded ETERNAL mint amount');
    });
  });
});
