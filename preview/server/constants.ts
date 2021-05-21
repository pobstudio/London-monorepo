import { BigNumber } from 'ethers';

export const RENDER_URL = 'https://saga.pob.studio';
export const OG_GRAPH_BANNER: [number, number] = [1200, 627];
export const CHAIN_ID = parseInt(process.env.CHAIN_ID ?? '1');

export const ALCHEMY_KEY =
  CHAIN_ID === 1 ? process.env.ALCHEMY_KEY : process.env.TEST_ALCHEMY_KEY ?? '';

export const ZERO = BigNumber.from(0);
