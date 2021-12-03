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
      'bafkreiat5awgasbr3x6nf4nn5jgrcryzirg4umpakx4wlwzxwgemnucl64',
      'bafkreiasv4cta6dk6sjjvut3tnpgdpyyugoyfmrxt5ta5ew6ptgfhxu2t4',
      'bafkreies7wx3dwkprjm2s3febaqx4rvrn7rlay2judxelafajunfmh4lce',
      'bafkreiaxwpl4h3v6nwfugqwp2eswxa3b32zslfpt2mothvoakuuwc5nu4q',
      'bafkreihajhhnrqdfl2qphvprtoopoc6h6snqdx5z2vrjdt4j5qbqzyqjn4',
      'bafkreicvubp4po6giqunn46n6tyt3bervqwgyg3yx4n6z23yqnjujnjdyy',
      'bafkreifzgahhhzlgcjxkewo2fpegxa6lu62fthatrjizbc5ssuooesf6aa',
      'bafkreic5krx5rb4wjkvib4mteqeswqncpczpmtqbcicp3xm4irpokngt3y',
      'bafkreihr7b3q6jam54k3i4ykj4ok3gwosoog5j3ixn6eh45vz3imbqcmb4',
      'bafkreihklgeis3ywgmw3om65saqcofiyecbwdsefot2knhvpnucz2fpfvu',
      'bafkreibg2wf2udju2ize3xxst7sgna57qm3mrkuprp7cpxdsjvkcnzgyle',
      'bafkreid5newx6shi5pxlygyeqrtfendhtplz2rhwwuhhcbm7aqeix635ue',
      'bafkreiedqvak5glcjvpglnhk6eibjiv4b7qz2326iwjf25h5x5meyyw6fm',
      'bafkreiggbode6zffwivswuh3u4ciabuvthv4j6w24dfqp2sfwy2af4ejv4',
      'bafkreib57no7j3fq554xw27fd5t3jmebw32etw7oruhdpplygucr4zerb4',
      'bafkreia32kx47z6x2lsvh5t2gm4jbga5dqo75hhg32y5a4jhopfjoyptoq',
    ],
    signature:
      '0xb33bfa16b5d91343dbf3cf6793a65f073ed6c83dfd9a48601e17b110475437a86f78d33da1ff5a746bda430e688b96c6cbe7f64a4e5b563cbe43ce75a95b38b01c',
    tokenType:
      '0x8000000000000000000000000000000400000000000000000000000000000000',
    to: '0x5766ab511a204C34661e85af5ba498E2e715A420',
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
