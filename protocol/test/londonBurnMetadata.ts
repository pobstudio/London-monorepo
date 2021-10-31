import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { LondonBurn } from '../typechain/LondonBurn';
import { LondonBurnMetadataFactory } from '../typechain/LondonBurnMetadataFactory';
import { ERC20Mintable } from '../typechain/ERC20Mintable';
import { ERC721Mintable } from '../typechain/ERC721Mintable';
import { expect } from 'chai';

const ONE_TOKEN_IN_BASE_UNITS = ethers.utils.parseEther('1');
const ONE_MWEI = ethers.utils.parseUnits('1', 'mwei');
const ONE_GWEI = ethers.utils.parseUnits('1', 'gwei');

describe('LondonBurnMetadata', function () {
  // constant values used in transfer tests
  let londonBurnFactory: LondonBurnMetadataFactory;
  let owner: Signer;
  let rando: Signer;
  let minter: Signer;
  let erc20Mintable: ERC20Mintable;
  let erc721Mintable: ERC721Mintable;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    rando = accounts[1];
    minter = accounts[2];
  });

  beforeEach(async function () {
    const LondonBurnMetadataFactory = await ethers.getContractFactory(
      'LondonBurnMetadataFactory',
    );

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

    londonBurnFactory = (await LondonBurnMetadataFactory.deploy()) as LondonBurnMetadataFactory;
    await londonBurnFactory.deployed();
  });

  describe('generateSVGImage', () => {
    it('test', async function () {
      console.log(await londonBurnFactory.generateSVGImage(4));
    });
  });
});
