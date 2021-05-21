import { useEffect } from 'react';
import { useState } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { TransactionStatus, useTransactionsStore } from '../stores/transaction';
import { useWeb3React } from '@web3-react/core';
import { useTokenMetadataContract } from './useContracts';
import { useOwnerByTokenId } from './useOwner';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { getEditionFromTokenId } from '../utils/token';
import { fetcher } from '../utils/fetcher';
import {
  GET_TOKEN_METADATA_BLOCK_BASED_QUERY,
  GET_TOKEN_METADATA_QUERY,
} from '../queries';

import { useQuery } from '@apollo/client';
import { useLastTruthyValue } from './useLastTruthyValue';
import { getBlockNumFromStoreWithDelay } from '../utils/stores';
import { TokenMetadataKey } from '../constants';

export type TokenMetadataStatus = 'updatable' | 'metadata' | TransactionStatus;

// TODO: feel like we need to generalize this
export const useTokenMetadata = (id: string | undefined) => {
  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);
  const registry = useTokenMetadataContract(true);
  const [isUpdatable, setIsUpdatable] = useState<boolean>(false);

  const results = useQuery(GET_TOKEN_METADATA_BLOCK_BASED_QUERY, {
    variables: { id, blockNum },
  });

  const data = useLastTruthyValue(results.data);
  const documents = useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.hash) {
      return null;
    }
    if (data.hash.documents.length === 0) {
      return null;
    }
    return data.hash.documents as any[];
  }, [data]);

  const owner = useOwnerByTokenId(id);

  const { account } = useWeb3React();

  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
    if (account?.toLowerCase() === owner) {
      setIsUpdatable(true);
    } else {
      setIsUpdatable(false);
    }
  }, [account, owner]);

  const possibleTxs = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) =>
        !tx.lastBlockNumChecked &&
        tx.metadata.type === 'updating-token-metadata' &&
        tx.metadata.tokenId === id,
    );
    const updatedTxs = Object.values(transactionMap)
      .filter(
        (tx) =>
          !!tx.lastBlockNumChecked &&
          tx.metadata.type === 'updating-token-metadata' &&
          tx.metadata.tokenId === id,
      )
      .sort(
        (a, b) =>
          (b.lastBlockNumChecked as number) - (a.lastBlockNumChecked as number),
      );
    return [...justAddedTxs, ...updatedTxs];
  }, [transactionMap, id]);

  const tx = useMemo(() => {
    return possibleTxs[0];
  }, [possibleTxs]);

  const txStatus: TransactionStatus | undefined = useMemo(() => tx?.status, [
    tx,
  ]);

  const updateMetadata = useCallback(
    async (keys: TokenMetadataKey[], texts: string[]) => {
      if (!isUpdatable) {
        return;
      }
      if (!id) {
        return;
      }
      try {
        const res = await registry?.writeDocuments(id, keys, texts);
        if (!!res) {
          addTransaction(res.hash, {
            tokenId: id,
            type: 'updating-token-metadata',
          });
          setError(undefined);
        }
      } catch (e) {
        console.error(e);
        setError(e);
      }
    },
    [isUpdatable, registry, documents, id],
  );

  const status: TokenMetadataStatus = useMemo(() => {
    if (!!txStatus) {
      return txStatus;
    }
    if (error) {
      return 'failed';
    }
    return isUpdatable ? 'updatable' : 'metadata';
  }, [error, txStatus, isUpdatable]);

  return {
    owner,
    error,
    tx,
    status,
    documents,
    updateMetadata,
  };
};
