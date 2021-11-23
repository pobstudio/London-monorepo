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

task('deploy-burn', 'Deploys LONDON EMBERS', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];
  const rando = (await hre.ethers.getSigners())[1];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  const name = 'LONDON Embers';
  const symbol = 'EMBERS';
  const revealBlockNumber = 0;

  // deploy london
  const Erc20Mintable = await hre.ethers.getContractFactory('ERC20Mintable');
  const erc20 = (await Erc20Mintable.deploy(
    await owner.getAddress(),
    'LONDON',
    'LONDON',
  )) as ERC20Mintable;

  await erc20.deployed();

  console.log('London deployed to:', erc20.address);

  // deploy LondonGift
  const ERC721Mintable = await hre.ethers.getContractFactory('ERC721Mintable');
  const londonGift = (await ERC721Mintable.deploy(
    'LONDON GIFT',
    'GIFT',
  )) as ERC721Mintable;

  await londonGift.deployed();
  console.log('LondonGift deployed to:', londonGift.address);

  const LondonBurn = await hre.ethers.getContractFactory('LondonBurn');
  const londonBurn = (await LondonBurn.deploy(name, symbol)) as LondonBurn;

  await londonBurn.deployed();
  console.log('LondonBurn deployed to:', londonBurn.address);

  const LondonBurnMinter = await hre.ethers.getContractFactory(
    'LondonBurnMinter',
  );
  const londonBurnMinter = (await LondonBurnMinter.deploy(
    londonBurn.address,
    erc20.address,
    londonGift.address,
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].sushiswap,
  )) as LondonBurnMinter;

  await londonBurnMinter.deployed();
  console.log('LondonBurnMinter deployed to:', londonBurnMinter.address);

  console.log('wiring metadata');
  await londonBurn.setMinter(londonBurnMinter.address);
  await londonBurnMinter.setTreasury(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
  );
  await londonBurn.setMintingAuthority(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersMintingAuthority,
  );
  await londonBurnMinter.setAirdropAuthority(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersMintingAuthority,
  );
  await londonBurn.setContractURI(
    `ipfs://${
      deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersContractURI
    }/`,
  );
  await londonBurn.setBaseMetadataURI(
    `ipfs://`,
  );
  // set block numbers
  await londonBurnMinter.setRevealBlockNumber(revealBlockNumber);

  // transfer ownership
  // await londonBurn.transferOwnership(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
  // );

  console.log('testnet mints');

  await erc20.mint(
    await owner.getAddress(),
    ONE_TOKEN_IN_BASE_UNITS.mul(100_000_000),
  );
  await erc20.mint(await rando.getAddress(), ONE_TOKEN_IN_BASE_UNITS.mul(2000));
  console.log('testnet nft mints');
  for (let i = 0; i < 20; ++i) {
    await londonGift.connect(owner).mint();
  }
  for (let i = 0; i < 20; ++i) {
    await londonGift.connect(rando).mint();
  }
});
