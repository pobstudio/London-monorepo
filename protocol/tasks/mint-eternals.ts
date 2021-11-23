import { BigNumber } from '@ethersproject/bignumber';
import { utils } from 'ethers';
import { task } from 'hardhat/config';
import { deployments } from '../deployments';
import { LondonGift } from '../typechain-types/LondonGift';
import { LondonBurnMinter } from '../typechain-types/LondonBurnMinter';
import { LondonBurn } from '../typechain-types/LondonBurn';
import { NETWORK_NAME_CHAIN_ID } from './utils';
import { ERC20Mintable } from '../typechain-types/ERC20Mintable';
import { ERC721Mintable } from '../typechain-types/ERC721Mintable';

const ONE_TOKEN_IN_BASE_UNITS = utils.parseEther('1');

const BLOCKS_PER_24_HRS = 6300;

const eternalMintChecks = [
  {
    tokenType:
      '0x8000000000000000000000000000000400000000000000000000000000000000',
    uris: [
      'mintcheck17',
      'mintcheck18',
      'mintcheck19',
      'mintcheck20',
      'mintcheck21',
      'mintcheck22',
      'mintcheck23',
      'mintcheck24',
      'mintcheck25',
      'mintcheck26',
      'mintcheck27',
      'mintcheck28',
      'mintcheck29',
      'mintcheck30',
      'mintcheck31',
    ],
    to: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    signature:
      '0xb80e3585a0909568bb7116c5103ff7a6c27ce0d4a17b3630a70a494012f0edb95bd065d116c459d72d8c41d675a6897b5066749f45496825b1bc70b8c08bcbf11b',
  },
];

task('mint-eternals', 'Deploys LONDON EMBERS', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  // const LondonBurnMinter = await hre.ethers.getContractFactory('LondonBurnMinter');
  // const londonBurnMinter = (await LondonBurnMinter.attach(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersMinter,
  // )) as LondonBurnMinter;

  const LondonBurn = await hre.ethers.getContractFactory('LondonBurn');
  // const londonBurn = (await LondonBurn.deploy(
  //   'TEST',
  //   'TEST'
  // )) as LondonBurn;
  const londonBurn = (await LondonBurn.attach(
    '0x60B03aB2571e2466eFA43D30801720285fa3765a',
  )) as LondonBurn;

  await londonBurn.deployed();
  console.log(londonBurn.address);
  // await londonBurn.setMintingAuthority(
  //   '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  // );
  // await londonBurn.setMinter(await owner.getAddress());
  await londonBurn.mintTokenType(eternalMintChecks[0]);
  // await londonBurn.setMinter(londonBurnMinter.address);
  // await londonBurnMinter.mintEternalType(eternalMintChecks);
});
