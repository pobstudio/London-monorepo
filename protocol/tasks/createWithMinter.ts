import { task } from 'hardhat/config';
import { BigNumber, Signer } from 'ethers';
import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { deployments } from '../deployments';
import { ETH_IN_WEI, NETWORK_NAME_CHAIN_ID } from '../utils';

task(
  'mint-nf',
  'Deploys NF token and adds a linear minter',
  async (args, hre) => {
    const owner = (await hre.ethers.getSigners())[0];

    await hre.run('compile');

    console.log(`deploying with ${await owner.getAddress()}`);

    // create erc1155
    const ERC1155Mintable = await hre.ethers.getContractFactory(
      'ERC1155Mintable',
    );
    const erc1155 = ERC1155Mintable.attach(
      deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc1155,
    ) as ERC1155Mintable;

    await erc1155.connect(owner).create(true);
  },
);
