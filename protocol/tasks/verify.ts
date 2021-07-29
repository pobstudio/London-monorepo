import { task } from 'hardhat/config';
import { BigNumber, Signer, utils } from 'ethers';
import { deployments } from '../deployments';
import { ETH_IN_WEI, NETWORK_NAME_CHAIN_ID } from '../utils';

const ONE_MWEI = utils.parseUnits('1', 'mwei');

task(
  'verify-etherscan',
  'Verifies contracts on Etherscan',
  async (args, hre) => {
    // await hre.run('verify:verify', {
    //   address: deployments[CHAIN_ID].erc1155,
    //   constructorArguments: [],
    // });

    // await hre.run('verify:verify', {
    //   address: deployments[CHAIN_ID].whitelistProxy,
    //   constructorArguments: [],
    // });

    // await hre.run("verify:verify", {
    //   address: deployments[CHAIN_ID].pobMinter,
    //   constructorArguments: [
    //   ],
    // })

    // await hre.run('verify:verify', {
    //   address: deployments[CHAIN_ID].genesisMinter,
    //   constructorArguments: [
    //     deployments[CHAIN_ID].hashRegistry,
    //     deployments[CHAIN_ID].pobMinter,
    //     deployments[CHAIN_ID].erc1155,
    //     '0xcc5Ddc8CCD5B1E90Bc42F998ec864Ead0090A12B',
    //     '0x8000000000000000000000000000000200000000000000000000000000000000',
    //     hre.ethers.utils.parseEther('0.05'),
    //     hre.ethers.utils.parseEther('0.001'),
    //     1000,
    //     2500,
    //   ],
    // });

    // await hre.run('verify:verify', {
    //   address: deployments[CHAIN_ID].pobMinterV2,
    //   constructorArguments: [
    //     deployments[CHAIN_ID].pobMinter,
    //     deployments[CHAIN_ID].erc1155,
    //     await owner.getAddress(),
    //     '0x8000000000000000000000000000000200000000000000000000000000000000',
    //     hre.ethers.utils.parseEther('0.05'),
    //     hre.ethers.utils.parseEther('0.001'),
    //     1000,
    //   ],
    // });

    // await hre.run('verify:verify', {
    //   address: deployments[CHAIN_ID].hashRegistry,
    //   constructorArguments: [deployments[CHAIN_ID].erc1155],
    // });

    // await hre.run('verify:verify', {
    //   address: deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].minter,
    //   constructorArguments: [
    //     12965000,
    //     BigNumber.from(6000).mul(ONE_MWEI).toString(),
    //     BigNumber.from(1).toString(),
    //     BigNumber.from(15590).mul(ONE_MWEI).toString(),
    //     BigNumber.from(1559).toString(),
    //   ],
    // });

    // await hre.run('verify:verify', {
    //   address: deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc20,
    //   constructorArguments: [
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].minter,
    //     'LONDON',
    //     'LONDON',
    //   ],
    // });

    const ONE_TOKEN_IN_BASE_UNITS = utils.parseEther('1');

    await hre.run('verify:verify', {
      address: deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].gift,
      constructorArguments: [
        '$LONDON Gift',
        'GIFT',
        deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc20,
        ONE_TOKEN_IN_BASE_UNITS.mul(1559).toString(),
        8888,
        '0xd46179dd40ee3254e5dff531d0cea44ddf279de734635a2fa75ee4a86ebfcc43',
      ],
    });

    // await hre.run('verify:verify', {
    //   address:
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].sagaHistoricMinter,
    //   constructorArguments: [
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].hashRegistry,
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc1155,
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
    //     '0x8000000000000000000000000000000400000000000000000000000000000000',
    //     hre.ethers.utils.parseEther('0.5'),
    //     hre.ethers.utils.parseEther('0.001'),
    //     2003,
    //   ],
    // });

    // await hre.run('verify:verify', {
    //   address:
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].sagaPersonalMinter,
    //   constructorArguments: [
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].hashRegistry,
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc1155,
    //     '0xF3087c9c2BDaBB111B8865ae5EfD38511eEd7556',
    //     deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
    //     '0x8000000000000000000000000000000300000000000000000000000000000000',
    //     hre.ethers.utils.parseEther('0.125'),
    //     23333,
    //   ],
    // });
  },
);
