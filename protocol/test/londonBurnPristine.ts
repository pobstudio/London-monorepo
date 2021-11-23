import { ethers, network, waffle } from 'hardhat';
import { BigNumber, Signer, utils } from 'ethers';

import { LondonBurn } from '../typechain-types/LondonBurn';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { expect, util } from 'chai';
import { chunk } from 'lodash';
import { deployments } from '../deployments';
import { newArray } from './utils';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const PRICE_PER_PRISTINE_MINT = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
const MAX_PRISTINE_AMOUNT_PER_MINT = 4;
const PRISTINE_MINTABLE_SUPPLY = 500;
const ONE_ETH = ethers.utils.parseUnits('1', 'ether');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');
const BAD_SIGNATURE =
  '0x4a18b9a27e75dbb5a7387b52f51f8a674db3f27923fe11ee481b72c630d3fd0d789bd8ba92f7a15138cdd7d174406d2d998dc4e9acd0e82c9b16efbe0324198d1b';
const PRISTINE_TYPE =
  '0x8000000000000000000000000000000300000000000000000000000000000000';
const TEAM_ADDRESS = '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4';
const LONDON_WHALE_ADDRESS = '0x7C849375786faE5e4984F50eea47360D75660a31';
const ULTRASONIC_BLOCK = 15_000_000;
const MAX_BLOCK_NUM =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  interface MintCheck {
    uris: string[];
    to: string;
    tokenType: string;
    signature: string;
  }

describe('LondonBurnPristine', function () {
  // constant values used in transfer tests
  let londonBurn: LondonBurn;
  let londonBurnMinter: LondonBurnMinter;
  let owner: Signer;
  let rando: Signer;
  let treasury: Signer;
  let mintingAuthority: Signer;
  let airdropAuthority: Signer;
  let minter: Signer;
  let londonWhale: Signer;
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
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [LONDON_WHALE_ADDRESS],
    });
    minter = await ethers.getSigner(TEAM_ADDRESS);
    londonWhale = await ethers.getSigner(LONDON_WHALE_ADDRESS);
    airdropAuthority = mintingAuthority;

    const Erc20Mintable = await ethers.getContractFactory('ERC20Mintable');
    erc20Mintable = (await Erc20Mintable.attach(
      deployments[1].erc20,
    )) as ERC20Mintable;
    await erc20Mintable.deployed();

    const ERC721Mintable = await ethers.getContractFactory('ERC721Mintable');
    erc721Mintable = (await ERC721Mintable.attach(
      deployments[1].gift,
    )) as ERC721Mintable;
    await erc721Mintable.deployed();

    // top up minter address
    await rando.sendTransaction({
      to: await minter.getAddress(),
      value: (await rando.getBalance()).div(4),
    });

    await rando.sendTransaction({
      to: await londonWhale.getAddress(),
      value: (await rando.getBalance()).div(4),
    });

    await erc20Mintable
      .connect(londonWhale)
      .transfer(await minter.getAddress(), await utils.parseEther('500000'));
  });

  beforeEach(async function () {
    const LondonBurn = await ethers.getContractFactory('LondonBurn');

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

  describe('mintPristineType', () => {
    it('should mint correctly with $LONDON', async function () {
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );
      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );

      await londonBurnMinter.connect(minter).mintPristineType(mintCheck);

      expect(await londonBurn.tokenTypeSupply(PRISTINE_TYPE)).to.eq(
        BigNumber.from(MAX_PRISTINE_AMOUNT_PER_MINT),
      );

      expect(
        await londonBurn.ownerOf(BigNumber.from(PRISTINE_TYPE).or('1')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(PRISTINE_TYPE).or('1')),
      ).to.eq(mintCheck.uris[0]);

      expect(
        await londonBurn.ownerOf(BigNumber.from(PRISTINE_TYPE).or('4')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(PRISTINE_TYPE).or('4')),
      ).to.eq(mintCheck.uris[3]);
      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT));
    });

    it('should mint correctly with ETH', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );

      const preBalance = await erc20Mintable.balanceOf(
        await treasury.getAddress(),
      );
      await londonBurnMinter.connect(minter).mintPristineType(mintCheck, {
        value: ONE_ETH.mul(10),
      });

      expect(await londonBurn.tokenTypeSupply(PRISTINE_TYPE)).to.eq(
        BigNumber.from(MAX_PRISTINE_AMOUNT_PER_MINT),
      );

      expect(
        await londonBurn.ownerOf(BigNumber.from(PRISTINE_TYPE).or('1')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(PRISTINE_TYPE).or('1')),
      ).to.eq(mintCheck.uris[0]);

      expect(
        await londonBurn.ownerOf(BigNumber.from(PRISTINE_TYPE).or('4')),
      ).to.eq(await minter.getAddress());
      expect(
        await londonBurn.tokenURI(BigNumber.from(PRISTINE_TYPE).or('4')),
      ).to.eq(mintCheck.uris[3]);

      expect(
        (await erc20Mintable.balanceOf(await treasury.getAddress())).sub(
          preBalance,
        ),
      ).to.eq(PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT));
      expect(await waffle.provider.getBalance(londonBurnMinter.address)).to.eq(
        BigNumber.from(0),
      );
    });
    it('should not mint if not enough balance of $LONDON', async function () {
      await erc20Mintable
        .connect(rando)
        .approve(
          londonBurnMinter.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );

      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );

      await expect(
        londonBurnMinter.connect(rando).mintPristineType(mintCheck),
      ).to.revertedWith('ERC20: transfer amount exceeds balance');
    });
    it('should not mint if not enough balance of ETH', async function () {
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        1,
        PRISTINE_TYPE,
      );

      await expect(
        londonBurnMinter.connect(rando).mintPristineType(mintCheck, {
          value: ONE_GWEI,
        }),
      ).to.revertedWith('UniswapV2Router: EXCESSIVE_INPUT_AMOUNT');
    });
    it('should not mint before revealBlockNumber', async function () {
      await londonBurnMinter.connect(owner).setRevealBlockNumber(MAX_BLOCK_NUM);
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );

      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );

      await expect(
        londonBurnMinter.connect(minter).mintPristineType(mintCheck),
      ).to.revertedWith('PRISTINE has not been revealed yet');
    });
    it('should not mint after ultraSonicForkBlockNumber', async function () {
      await londonBurnMinter.connect(owner).setUltraSonicForkBlockNumber(1);
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT),
        );
      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );
      await expect(
        londonBurnMinter.connect(minter).mintPristineType(mintCheck),
      ).to.revertedWith('ULTRASONIC MODE ENGAGED');
    });
    it('should not mint more than MAX_PRISTINE_AMOUNT_PER_MINT per mint', async function () {
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT + 1),
        );

      const mintCheck = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT + 1,
        PRISTINE_TYPE,
      );

      await expect(
        londonBurnMinter.connect(minter).mintPristineType(mintCheck),
      ).to.revertedWith('Exceeded per tx mint amount');
    });
    it('should not mint more consecutively', async function () {
      await erc20Mintable
        .connect(minter)
        .approve(
          londonBurnMinter.address,
          PRICE_PER_PRISTINE_MINT.mul(MAX_PRISTINE_AMOUNT_PER_MINT).mul(2),
        );

      const mintCheck1 = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );
      const mintCheck2 = await getMintCheck(
        await minter.getAddress(),
        MAX_PRISTINE_AMOUNT_PER_MINT,
        PRISTINE_TYPE,
      );

      await londonBurnMinter
        .connect(minter)
        .mintPristineType(mintCheck1);
      await expect(
        londonBurnMinter.connect(minter).mintPristineType(mintCheck2),
      ).to.revertedWith("Can't mint consecutively");
    });
    it('should not mint if exceeded mintable supply', async function () {
      console.log('COMMENTED OUT');
      //   await londonBurn.connect(owner).setRevealBlockNumber(0);
      //   await londonBurn.connect(owner).setTreasury(await treasury.getAddress());
      //   await londonBurn
      //     .connect(owner)
      //     .setMintingAuthority(await mintingAuthority.getAddress());
      //   await erc20Mintable
      //     .connect(minter)
      //     .approve(
      //       londonBurn.address,
      //       PRICE_PER_PRISTINE_MINT.mul(PRISTINE_MINTABLE_SUPPLY + 1),
      //     );
      //   await erc20Mintable
      //     .connect(minter1)
      //     .approve(
      //       londonBurn.address,
      //       PRICE_PER_PRISTINE_MINT.mul(PRISTINE_MINTABLE_SUPPLY + 1),
      //     );

      //   const mintCheck = await getMintCheck(
      //     await minter.getAddress(),
      //     PRISTINE_MINTABLE_SUPPLY,
      //   );

      //   const groupedMintCheck = chunk(mintCheck, 4);

      //   let i = 0;
      //   for (const gmc of groupedMintCheck) {
      //     if (i % 2 == 0) {
      //       await londonBurn.connect(minter).mintPristineType(gmc);
      //     } else {
      //       await londonBurn.connect(minter1).mintPristineType(gmc);
      //     }
      //     i++;
      //   }

      //   await expect(await londonBurn.tokenTypeSupply(PRISTINE_TYPE)).to.eq(
      //     BigNumber.from(PRISTINE_MINTABLE_SUPPLY),
      //   );

      //   const mintCheck: MintCheck = {
      //     URI: 'ipfs://mintcheck',
      //     to: await treasury.getAddress(),
      //     signature: BAD_SIGNATURE,
      //   };

      //   const mintCheckHash = ethers.utils.solidityKeccak256(
      //     ['address', 'string'],
      //     [mintCheck.to, mintCheck.URI],
      //   );

      //   const bytesMintCheckHash = ethers.utils.arrayify(mintCheckHash);

      //   const mintCheckHashSig = await mintingAuthority.signMessage(
      //     bytesMintCheckHash,
      //   );
      //   mintCheck.signature = mintCheckHashSig;
      //   await expect(
      //     londonBurn.connect(treasury).mintPristineType([mintCheck]),
      //   ).to.revertedWith('Exceeded PRISTINE mint amount');
    });
  });
});
