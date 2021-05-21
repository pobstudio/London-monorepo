import { THE_GRAPH_BLOCK_NUM_DELAY } from '../constants';

export const getBlockNumFromStoreWithDelay = (
  s: any,
  delay = THE_GRAPH_BLOCK_NUM_DELAY,
) => (!!s.blockNumber ? s.blockNumber - delay : undefined);
