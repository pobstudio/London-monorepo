import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { NULL_SIGNATURE } from '../constants';
import {
  BURN_NOBLE_AIRDROP_AMOUNT,
  TokenType,
  TOKEN_TYPES,
} from '../constants/parameters';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import { AirdropCheckWithAirdropState } from '../types';
import { fetcher } from '../utils/fetcher';
import {
  useLondonEmbersContract,
  useLondonEmbersMinterContract,
  useLondonGiftContract,
} from './useContracts';

const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

export const useGiftBurned = () => {
  const gift = useLondonGiftContract();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [burnedAmount, setBurnedAmount] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!gift) {
      return;
    }
    gift.balanceOf(DEAD_ADDRESS).then((b) => {
      setBurnedAmount(b.toNumber());
    });
  }, [gift, transactionMap, blockNumber]);

  return burnedAmount;
};
