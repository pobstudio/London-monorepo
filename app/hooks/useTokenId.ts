import { useQuery } from '@apollo/client';
import { BigNumber } from '@ethersproject/bignumber';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import useSWR from 'swr';
import { ZERO } from '../constants';
import {
  GET_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY,
  GET_TOKEN_METADATA_QUERY,
} from '../queries';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import { fetcher } from '../utils/fetcher';
import { getBlockNumFromStoreWithDelay } from '../utils/stores';
import { useLastTruthyValue } from './useLastTruthyValue';

export const useTokenId = (hash: string | undefined) => {
  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);
  const results = useQuery(GET_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY, {
    variables: {
      hash,
      blockNum,
    },
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!hash) {
      return undefined;
    }
    if (!data) {
      return undefined;
    }
    if (!data.hashes) {
      return undefined;
    }
    if (!data.hashes[0]) {
      return undefined;
    }
    return data.hashes[0].id as string;
  }, [hash, data]);
};

export const useTokenIdFast = (hash: string | undefined) => {
  const tokenIdsMap = useTokenIdsFast(!!hash ? [hash] : undefined);
  return useMemo(() => {
    if (!tokenIdsMap || !hash) {
      return undefined;
    }
    if (!tokenIdsMap[hash]) {
      return null;
    }
    return tokenIdsMap[hash];
  }, [tokenIdsMap, hash]);
};

export const useTokenIdsFast = (hashes: string[] | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(
      () =>
        !!hashes && hashes.length != 0
          ? `/api/token-id?&hashes=${hashes.join(',')}`
          : null,
      [hashes, transactionMap, blockNumber],
    ),
    fetcher,
  );

  return useMemo(() => {
    if (!data || !hashes) {
      return undefined;
    }
    if (!data.tokenIds) {
      return {};
    }
    return data.tokenIds as { [key: string]: string };
  }, [data]);
};
