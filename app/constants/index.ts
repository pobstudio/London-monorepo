import { BigNumber } from 'ethers';

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const MIN_BLOCK_CONFIRMATIONS = 30;

export const ZERO = BigNumber.from(0);

export const THE_GRAPH_BLOCK_NUM_DELAY = 2;

export const MINT_BLOCK_NUM = 244555;

export const SPRING_CONFIG = { mass: 1, tension: 100, friction: 40 };

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');
// export const CHAIN_ID = parseInt('4'); // parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');

export const ALCHEMY_KEY =
  CHAIN_ID === 1
    ? process.env.NEXT_PUBLIC_ALCHEMY_KEY
    : process.env.NEXT_PUBLIC_TEST_ALCHEMY_KEY ?? '';

export const MAINNET_ALCHEMY_KEY =
  process.env.NEXT_PUBLIC_MAINNET_ALCHEMY_KEY || '';

export const DRAW_ALCHEMY_KEY = process.env.DRAW_ALCHEMY_KEY;

export const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export const COVALENT_API_KEY = process.env.COVALENT_KEY ?? '';

export const MIXPANEL_KEY = process.env.NEXT_PUBLIC_MIXPANEL_KEY;

export const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

export const FORTMATIC_KEY = process.env.NEXT_PUBLIC_FORTMATIC_KEY || '';

export const S1_SAGA_LAUNCH = new Date('April 26, 2021 16:00:00 UTC');

export const TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP = {
  title: '0xd2129090dde473b4355599dbb953ca35e3ad8907f1750f1ee17e77f3cfabbbce',
  description:
    '0x1596dc38e2ac5a6ddc5e019af4adcc1e017a04f510d57e69d6879d5d2996bb8e',
};

export type TokenMetadataKey = keyof typeof TOKEN_METADATA_HASH_TO_READABLE_KEYS_MAP;

// TODO: REMOVE
export const DEFAULT_PREVIEW_HASHES = [
  '0x1b6d3cc31110ec6dc949319d3db8dfecd6328d1a16ea9a14eee093d813b9837c',
  '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa',
];

// links
export const STUDIO_PROD_LINK = 'https://pob.studio';

export const HASH_PROD_LINK = 'https://hash.pob.studio';

export const UNISWAP_GRAPH_QL =
  'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';

export const BLOG_LINK = `https://pobstudio.substack.com`;

export const TWITTER_LINK = `https://twitter.com/prrfbeauty`;

export const DISCORD_LINK = `https://discord.gg/x4SH5pGgvj`;

export const WHAT_IS_ALL_NONSENSE_LINK = `https://pobstudio.substack.com/p/deciphering-pobs-artistic-process`;
export const WHAT_IS_ALL_NONSENSE_LINK_SAGA = `https://pobstudio.substack.com/p/how-sagas-algorithm-works`;

export const NFT_LICENSE_LINK = `https://www.nftlicense.org`;

export const OPENSEA_LINK = `https://opensea.io/collection/proof-of-beauty`;

export const SEASON_LINK = `https://pobstudio.substack.com/p/time-is-fleeting-genesis-is-not`;

export const GITHUB_LINK = `https://github.com/proofofbeauty/gateway`;

export const IPFS_GATEWAY_LINK = `https://bafybeigqa2kstuhkvfzonokpxwh65f2bmhkyxux2lqhzbagdv3um7dmbuq.ipfs.dweb.link`;

export const PREVIEW_IMAGE_LINK = `https://hash-preview.vercel.app`;

export const POB_SUBGRAPH_LINK = `https://api.thegraph.com/subgraphs/name/proofofbeauty/hash`;
export const POB_TEST_SUBGRAPH_LINK = `https://api.thegraph.com/subgraphs/name/proofofbeauty/hash-rinkeby`;

// OG banners

export const GLOBAL_OG_BANNER = `/banner/saga.png`;

// dimensions
export const HEADER_HEIGHT = 80;

export const MOBILE_HEADER_HEIGHT = 80;

export const FOOTER_HEIGHT = 100;

export const MOBILE_FOOTER_HEIGHT = 140;
