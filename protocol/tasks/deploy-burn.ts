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

  console.log('helllo');
  console.log(`deploying with ${await owner.getAddress()}`);

  const name = 'LONDON Embers';
  const symbol = 'EMBERS';
  const revealBlockNumber = 0;

  console.log('wut');

  // deploy london
  const Erc20Mintable = await hre.ethers.getContractFactory('ERC20Mintable');
  const erc20 = (await Erc20Mintable.attach(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc20,
  )) as ERC20Mintable;

  await erc20.deployed();

  console.log('wut');

  console.log('London deployed to:', erc20.address);

  const blockNum = 13533333;
  const ethBalance = await hre.ethers.provider.getBalance(
    deployments[1].multisig,
    blockNum,
  );
  const londonBalance = await erc20.balanceOf(deployments[1].multisig, {
    blockTag: blockNum,
  });
  console.log('eth balance: ', utils.formatEther(ethBalance));
  console.log('london balance: ', utils.formatEther(londonBalance));

  // // deploy LondonGift
  // const LondonGift = await hre.ethers.getContractFactory('LondonGift');
  // const londonGift = (await LondonGift.attach(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].gift,
  // )) as LondonGift;

  // await londonGift.deployed();
  // console.log('LondonGift deployed to:', londonGift.address);

  // const LondonBurn = await hre.ethers.getContractFactory('LondonBurn');
  // const londonBurn = (await LondonBurn.attach(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embers,
  // )) as LondonBurn;

  // await londonBurn.deployed();
  // console.log('LondonBurn deployed to:', londonBurn.address);

  // const LondonBurnMinter = await hre.ethers.getContractFactory(
  //   'LondonBurnMinter',
  // );
  // const londonBurnMinter = (await LondonBurnMinter.deploy(
  //   londonBurn.address,
  //   erc20.address,
  //   londonGift.address,
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].sushiswap,
  // )) as LondonBurnMinter;

  // await londonBurnMinter.deployed();
  // console.log('LondonBurnMinter deployed to:', londonBurnMinter.address);

  // console.log('wiring metadata');
  // await londonBurn.setMinter(londonBurnMinter.address);
  // await londonBurnMinter.setTreasury(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
  // );
  // // await londonBurn.setMintingAuthority(
  // //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersMintingAuthority,
  // // );
  // await londonBurnMinter.setAirdropAuthority(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersMintingAuthority,
  // );
  // await londonBurn.setContractURI(
  //   `ipfs://${
  //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersContractURI
  //   }/`,
  // );
  // await londonBurn.setBaseMetadataURI(`ipfs://`);
  // set block numbers
  // await londonBurnMinter.setRevealBlockNumber(revealBlockNumber);

  // transfer ownership
  // await londonBurn.transferOwnership(
  //   deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
  // );
});
