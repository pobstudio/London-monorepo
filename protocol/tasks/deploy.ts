import { BigNumber } from '@ethersproject/bignumber';
import { utils } from 'ethers';
import { task } from 'hardhat/config';
import { deployments } from '../deployments';
import { Erc20Mintable } from '../typechain/ERC20Mintable';
import { GasPriceBasedMinter } from '../typechain/GasPriceBasedMinter';
import { NETWORK_NAME_CHAIN_ID } from '../utils';

const ONE_MWEI = utils.parseUnits('1', 'mwei');

task('deploy', 'Deploys $LONDON ', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  const tokenSymbol = 'LONDON';
  const tokenName = 'LONDON';

  const blockNumberUpTo = 12965000;

  const a = BigNumber.from(6000).mul(ONE_MWEI);
  const b = BigNumber.from(1);
  const c = BigNumber.from(15590).mul(ONE_MWEI);
  const d = BigNumber.from(1559);

  // deploy gas price minter
  const GasPriceBasedMinter = await hre.ethers.getContractFactory(
    'GasPriceBasedMinter',
  );
  const minter = (await GasPriceBasedMinter.deploy(
    blockNumberUpTo,
    a,
    b,
    c,
    d,
  )) as GasPriceBasedMinter;
  await minter.deployed();
  console.log('GasPriceBasedMinter deployed to:', minter.address);

  // deploy erc1155
  const Erc20Mintable = await hre.ethers.getContractFactory('ERC20Mintable');

  const erc20 = (await Erc20Mintable.deploy(
    minter.address,
    tokenName,
    tokenSymbol,
  )) as Erc20Mintable;
  await erc20.deployed();
  console.log('Erc20Mintable deployed to:', erc20.address);

  // wire minting rights
  console.log('wiring minting rights');
  await minter.setErc20(erc20.address);

  // transfer ownership
  console.log('transfering ownership');
  await minter.renounceOwnership();

  await erc20.transferOwnership(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].multisig,
  );
});
