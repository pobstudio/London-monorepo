import { BigNumber, utils } from 'ethers';

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_SIGNATURE =
  '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export const LONDON_GIFT_CONTRACT = `0x7645eec8bb51862a5aa855c40971b2877dae81af`;

export const HASH_CONTRACT = `0xe18a32192ed95b0fe9d70d19e5025f103475d7ba`;

export const LONDON_EMBERS_CONTRACT = `0x971fe57134d1b1b3d8d62ccadff1d2cf67e2b8ce`;

export const ZERO = BigNumber.from(0);

export const MAX_APPROVAL = BigNumber.from(2).pow(256).sub(1);

export const TOKEN_SYMBOL = '$LONDON';

export const ONE_TOKEN_IN_BASE_UNITS = utils.parseEther('1');

export const ONE_MWEI = utils.parseUnits('1', 'mwei');

export const BLOCKS_PER_24_HRS = 6300;

export const ONE_GWEI = utils.parseUnits('1', 'gwei');

export const OPENSEA_ASSET_NAME = 'london-gift-v2';
export const EMBERS_OPENSEA_ASSET_NAME = 'london-embers';
export const OPENSEA_ASSET_URL = 'london-gift-v2';

export const OPENSEA_API_KEY = 'fc09ae6245fb40ab8afbcff451553345';

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');

export const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY ?? '';

export const IPFS_LINK = `https://ipfs.io/ipfs`;

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

export const SELECTABLE_FOREGROUND: [string, string][] = [
  ['0xed5af388653567af2f388e6224dc7c4b3241c544', 'Azuki'],
  ['0x59468516a8259058bad1ca5f8f4bff190d30e066', 'Invisible Friends'],
  ['0x4c4808459452c137fb9bf3e824d4d7ac73655f54', 'Quilts'],
  ['0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', 'Doodles'],
  ['0x31d4da52c12542ac3d6aadba5ed26a3a563a86dc', 'Fly Frogs'],
  ['0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', 'BAYC'],
  ['0x60e4d786628fea6478f785a6d7e704777c86a7c6', 'MAYC'],
  ['0xbd3531da5cf5857e7cfaa92426877b022e612cf8', 'Pudgy Penguins'],
  ['0x1a92f7381b9f03921564a437210bb9396471050c', 'Cool Cats'],
  ['0x85f740958906b317de6ed79663012859067e745b', 'Wicked Cranium'],
  ['0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', 'CryptoPunks'],
  ['0x02aa731631c6d7f8241d74f906f5b51724ab98f8', 'BearsOnTheBlock'],
  ['0x031920cc2d9f5c10b444fd44009cd64f829e7be2', 'CryptoZunks'],
  ['0xdb55584e5104505a6b38776ee4dcba7dd6bb25fe', 'Imma Degen'],
  ['0xe19b9d6538c1ab71434098d9806a7cec5b186ba0', 'Bored Bananas'],
  ['0xd7b397edad16ca8111ca4a3b832d0a5e3ae2438c', 'Gutter Rats'],
  ['0xf4ee95274741437636e748ddac70818b4ed7d043', 'The Doge Pound'],
  ['0x099689220846644f87d1137665cded7bf3422747', 'Robotos'],
  ['0xef0182dc0574cd5874494a120750fd222fdb909a', 'Rumble Kong'],
  ['0xedb61f74b0d09b2558f1eeb79b247c1f363ae452', 'Gutter Cat Gang'],
  ['0x31385d3520bced94f77aae104b406994d8f2168c', 'Bastard GAN punk v2'],
  ['0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb', 'Vee Friends'],
  ['0xbea8123277142de42571f1fac045225a1d347977', 'DystoPunks V2'],
  ['0x495f947276749ce646f68ac8c248420045cb7b5e', 'DystoPunks V1'],
  ['0x5fd335e64400eabecc9ebe80e3d2fcfb6c001adb', 'Niftysistas'],
  ['0x892555e75350e11f2058d086c72b9c94c9493d72', 'Niftydudes'],
  ['0x2acab3dea77832c09420663b0e1cb386031ba17b', 'DeadFellaz'],
  ['0x495f947276749ce646f68ac8c248420045cb7b5e', '24px Cats'],
  ['0x488a85d21ac95c9bb0cdaa0d2bfa427fcea88d1e', 'Bored Punk Yacht Club'],
  ['0x97597002980134bea46250aa0510c9b90d87a587', 'Chain Runners'],
  ['0x45db714f24f5a313569c41683047f1d49e78ba07', 'SpacePunksClub'],
];
