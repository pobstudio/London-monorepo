import { useEffect } from 'react';
import { useState } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { NULL_ADDRESS, ZERO } from '../constants';
import { useTokenId, useTokenIdFast } from './useTokenId';
import { useTransactionsStore } from '../stores/transaction';
import { useMemo } from 'react';
import { fetcher } from '../utils/fetcher';
import { useQuery } from '@apollo/client';
import { GET_TOKEN_METADATA_BLOCK_BASED_QUERY } from '../queries';
import { useLastTruthyValue } from './useLastTruthyValue';
import { getBlockNumFromStoreWithDelay } from '../utils/stores';
import useSWR from 'swr';

export const useOwnerByTokenId = (tokenId: string | undefined) => {
  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);

  const results = useQuery(GET_TOKEN_METADATA_BLOCK_BASED_QUERY, {
    variables: { id: tokenId, blockNum },
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!tokenId) {
      return undefined;
    }
    if (!data) {
      return undefined;
    }
    if (!data.hash) {
      return undefined;
    }
    if (data.hash.ownership.length === 0) {
      return undefined;
    }
    const ownership = data.hash.ownership[0];
    if (ownership.owner === NULL_ADDRESS) {
      return undefined;
    }
    return ownership.owner as string;
  }, [tokenId, data]);
};

export const useOwnerByHash = (hash: string | undefined) => {
  const tokenId = useTokenId(hash);
  return useOwnerByTokenId(tokenId);
};

export const useOwnerByTokenIdFast = (tokenId: string | undefined) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  // const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(() => (!!tokenId ? `/api/owner?&tokenIds=${tokenId}` : null), [
      tokenId,
      transactionMap,
    ]),
    fetcher,
  );

  return useMemo(() => {
    if (!data || !tokenId) {
      return undefined;
    }
    if (!data.owners) {
      return undefined;
    }
    if (data.owners[tokenId] === NULL_ADDRESS) {
      return null;
    }
    return data.owners[tokenId] as string;
  }, [data, tokenId]);
};

export const useOwnerByHashFast = (hash: string | undefined) => {
  const tokenId = useTokenIdFast(hash);
  return useOwnerByTokenIdFast(tokenId ?? undefined);
};
