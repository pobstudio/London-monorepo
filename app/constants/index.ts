import { BigNumber, utils } from 'ethers';

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ZERO = BigNumber.from(0);

export const MAX_APPROVAL = BigNumber.from(2).pow(256).sub(1);

export const TOKEN_SYMBOL = '$LONDON';

export const ONE_TOKEN_IN_BASE_UNITS = utils.parseEther('1');

export const ONE_MWEI = utils.parseUnits('1', 'mwei');

export const BLOCKS_PER_24_HRS = 6300;

export const ONE_GWEI = utils.parseUnits('1', 'gwei');

export const OPENSEA_ASSET_NAME = 'london-gift-v2';

export const OPENSEA_ASSET_URL = 'london-gift-v2';

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');

export const ALCHEMY_KEY =
  CHAIN_ID === 1
    ? process.env.NEXT_PUBLIC_ALCHEMY_KEY
    : process.env.NEXT_PUBLIC_TEST_ALCHEMY_KEY ?? '';

export const GRAPH_SUBGRAPH_LINK =
  'https://api.thegraph.com/subgraphs/name/proofofbeauty/london';
export const GRAPH_TEST_SUBGRAPH_LINK =
  'https://api.thegraph.com/subgraphs/name/proofofbeauty/london-rinkeby';

export const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

// links
export const UNISWAP_TRADE_LINK =
  'https://app.uniswap.org/#/swap?inputCurrency=0x491d6b7d6822d5d4bc88a1264e1b47791fd8e904&outputCurrency=ETH';

export const STUDIO_PROD_LINK = 'https://pob.studio';

export const LONDON_PROD_LINK = 'https://london.pob.studio';

export const BLOG_LINK = `https://pob.mirror.xyz`;

export const TWITTER_LINK = `https://twitter.com/prrfbeauty`;

export const DISCORD_LINK = `https://discord.gg/x4SH5pGgvj`;

export const SNAPSHOT_LINK = `https://snapshot.org/#/london.pob.eth`;

export const NFT_LICENSE_LINK = `https://www.nftlicense.org`;

// strings
export const LONDON_EMOJI = `🏙🌙💃🏻`;

// OG banners
export const GLOBAL_OG_BANNER = `${LONDON_PROD_LINK}/banner/default.png`;
