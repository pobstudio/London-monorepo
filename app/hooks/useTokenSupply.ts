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
} from './useContracts';

export const useEmbersTokenSupply = (tokenType: TokenType) => {
  const tokenTypeUint = useMemo(() => TOKEN_TYPES[tokenType], [tokenType]);
  const embers = useLondonEmbersContract();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [tokenSupply, setTokenSupply] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!embers) {
      return;
    }
    embers.tokenTypeSupply(tokenTypeUint).then((b) => {
      setTokenSupply(b.toNumber());
    });
  }, [tokenTypeUint, embers, transactionMap, blockNumber]);

  return tokenSupply;
};
