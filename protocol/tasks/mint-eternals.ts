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
    "uris": [
      "bafkreie27nxzrwshr3lluqzbvpq2vqyar2oclup4icuhv3m6dmww4mfnse"
    ],
    "signature": "0x5d8e5db1fd53de66654dfc838f7a3ab497fc4c7ed39c927e5f6108c7432bb4ba1e61c9fffd639feb3323be7d9d3dc66c342e68513dd2ed44608df28a53211e4a1b",
    "tokenType": "0x8000000000000000000000000000000400000000000000000000000000000000",
    "to": "0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4"
  },
];

task('mint-eternals', 'Deploys LONDON EMBERS', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  const LondonBurn = await hre.ethers.getContractFactory('LondonBurn');
  const londonBurn = (await LondonBurn.attach(
    '0x971fe57134d1b1B3D8D62cCADFF1D2CF67e2B8CE',
  )) as LondonBurn;

  await londonBurn.deployed();
  // await londonBurn.mintTokenType(eternalMintChecks[0]);

  console.log(await londonBurn.tokenURI(BigNumber.from('57896044618658097711785492504343953927996121800504035873582290433683637665793')));
});
