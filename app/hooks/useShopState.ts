import { useMemo } from 'react';
import {
  BLOCK_NUMBER_MINT_START_AT,
  MAX_SUPPLY,
} from '../constants/parameters';
import { useBlockchainStore } from '../stores/blockchain';
import { useGiftStore } from '../stores/gift';

export type ShopState = 'not-open' | 'open' | 'sold-out';

export const useShopState = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const tokenIndex = useGiftStore((s) => s.tokenIndex);
  return useMemo(() => {
    if (!blockNumber) {
      return 'not-open';
    }
    if (blockNumber < BLOCK_NUMBER_MINT_START_AT) {
      return 'not-open';
    }
    if (tokenIndex >= MAX_SUPPLY) {
      return 'sold-out';
    }
    return 'open';
  }, [tokenIndex, blockNumber]);
};
