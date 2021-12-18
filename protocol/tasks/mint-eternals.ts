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
    uris: [
      'bafkreie7cpeftz36e27rtfcy33bu27kfqlekljxwkbe46dxe55ejvcke6a',
      'bafkreihc4qgtmrmupljsst44ply3skmkejeadvnuuoirnq4oiykhunkmse',
      'bafkreigcwupghg4we5ezbdpnwrlq2dbnwnlhu5speuneokd33bizpjywki',
      'bafkreib3oiamp3hqyiu53tjwyiaels5qwnqgtq4lkgnrxoqmb3g4npce24',
      'bafkreicvyr26k6j3iy3iqi3jqbuptsc7zlqszrqi5pbwfxxdbnmt5enihe',
      'bafkreidkwbso7wbxc7xqdlrt7ljgbef6scxtiaa4kxclt3qfa7swicj6ou',
      'bafkreib5i4eke3itpo2stjxc42e5xj457wf6q442r3efo6e7hgagbazazu',
      'bafkreiaj5ryjuje2rf6lwqwtfsz2fywwdwjpq2jlzrl4b5qw27jbg7qkya',
      'bafkreib3kvgitwrxspvhnohezr75jaw73pzqfb6ivayvjrd64qobogpy3y',
      'bafkreihvzgeax744yqtfmx6f5iz6lfau7orhshcojkw7wlvaluyofvlwle',
      'bafkreid3itj347puwjbl6fxu5fqe7ld6fskoipmcsw2ieaqlk5nuaab4sa',
      'bafkreigy6myj2da7lczh64n57wuiv4dkpefvdny572nypd75cj7clvhcfe',
      'bafkreihgxekppasxwilf6d3kvudv444ca4v2snjq4wkztsrpjmsqeu6rca',
      'bafkreiaalnsqfd4jfiysotlymwrvhngriqgcipc6cercrvhwxng6owi6ea',
      'bafkreice2oz7tknbj5dek3vozlkruuu3n2tzrpvl6jxo5o2ldrisflua5y',
      'bafkreih5k5szztbisnsmwfuzwnuz2fkngzktsjqrkelzalzzvacswmw5oi',
    ],
    signature:
      '0xc638d2de3f930db05a0acd56c5bae9656aa224fa1d3618a3d6bec1ac146e7eb510613682802a8825963181a3b0523e7f22b9fe9a39d32cfb2331dba80363422d1c',
    tokenType:
      '0x8000000000000000000000000000000400000000000000000000000000000000',
    to: '0x5766ab511a204C34661e85af5ba498E2e715A420',
  },
];

task('mint-eternals', 'Deploys LONDON EMBERS', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  const LondonBurnMinter = await hre.ethers.getContractFactory(
    'LondonBurnMinter',
  );
  const londonBurnMinter = (await LondonBurnMinter.attach(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].embersMinter,
  )) as LondonBurnMinter;

  const res = await londonBurnMinter.mintEternalType(eternalMintChecks[0]);
  console.log(res.hash);
  res.wait();
});
