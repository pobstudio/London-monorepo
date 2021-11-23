import { BigNumber, utils } from 'ethers';

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_SIGNATURE =
  '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export const LONDON_GIFT_CONTRACT = `0x7645eec8bb51862a5aa855c40971b2877dae81af`;

export const HASH_CONTRACT = `0xe18a32192ed95b0fe9d70d19e5025f103475d7ba`;

export const ZERO = BigNumber.from(0);

export const MAX_APPROVAL = BigNumber.from(2).pow(256).sub(1);

export const TOKEN_SYMBOL = '$LONDON';

export const ONE_TOKEN_IN_BASE_UNITS = utils.parseEther('1');

export const ONE_MWEI = utils.parseUnits('1', 'mwei');

export const BLOCKS_PER_24_HRS = 6300;

export const ONE_GWEI = utils.parseUnits('1', 'gwei');

export const OPENSEA_ASSET_NAME = 'london-gift-v2';

export const OPENSEA_ASSET_URL = 'london-gift-v2';

export const OPENSEA_API_KEY = 'fc09ae6245fb40ab8afbcff451553345';

export const CHAIN_ID = parseInt('4'); // parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');

export const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY ?? '';

export const ALCHEMY_KEY =
  CHAIN_ID === 1
    ? process.env.NEXT_PUBLIC_ALCHEMY_KEY
    : process.env.NEXT_PUBLIC_TEST_ALCHEMY_KEY ?? '';

export const GRAPH_SUBGRAPH_LINK =
  'https://api.thegraph.com/subgraphs/name/proofofbeauty/london';
export const GRAPH_TEST_SUBGRAPH_LINK =
  'https://api.thegraph.com/subgraphs/name/proofofbeauty/london-rinkeby';

// links
export const UNISWAP_TRADE_LINK =
  'https://matcha.xyz/markets/1/0x491d6b7d6822d5d4bc88a1264e1b47791fd8e904/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const ADD_LIQUIDITY_LINK =
  'https://analytics.sushi.com/pairs/0xd5a7d56ea8a36f855be3720cec1c9b8e4d30c732';

export const STUDIO_PROD_LINK = 'https://pob.studio';

export const LONDON_PROD_LINK = 'https://london.pob.studio';

export const MERGE_LINK =
  'https://github.com/ethereum/pm/blob/master/Merge/mainnet-readiness.md';

export const ULTRASOUND_LINK = `https://ultrasound.money/`;

export const BLOG_LINK = `https://pob.mirror.xyz`;

export const GITHUB_LINK = `https://github.com/proofofbeauty/LONDON-monorepo`;

export const TWITTER_LINK = `https://twitter.com/prrfbeauty`;

export const DAO_TWITTER_LINK = `https://twitter.com/londondao`;

export const DISCORD_LINK = `https://discord.gg/pob`;

export const SNAPSHOT_LINK = `https://snapshot.org/#/london.pob.eth`;

export const OPENSEA_LINK = `https://opensea.io/collection/london-gift-v2`;

export const NFT_LICENSE_LINK = `https://www.nftlicense.org`;

export const NOTION_WIKI_LINK = `https://london-dao.notion.site/LONDON-Night-Club-DAO-bb3fcec4c153427894d279602d5c78de`;

export const DUNE_DASHBOARD_LINK = `https://dune.xyz/0xminion/Proof-of-Beauty%27s-dollarLONDON-Gift-Dashboard`;

// strings
export const LONDON_EMOJI = `🏙🌙💃🏻`;

export const LONDON_DAO_TITLE = `💷LondonDAO`;

// OG banners
export const GLOBAL_OG_BANNER = `${LONDON_PROD_LINK}/banner/default.png`;
