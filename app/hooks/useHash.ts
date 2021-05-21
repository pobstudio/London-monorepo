import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_TOKEN_METADATA_BLOCK_BASED_QUERY } from '../queries';
import { useBlockchainStore } from '../stores/blockchain';
import { fetcher } from '../utils/fetcher';
import { TX_HASH_REGEX } from '../utils/regex';
import { getBlockNumFromStoreWithDelay } from '../utils/stores';
import { useLastTruthyValue } from './useLastTruthyValue';

// util check to see if it abides to id format
export const useHash = (hashOrId: string | undefined) => {
  const blockNum = useBlockchainStore(getBlockNumFromStoreWithDelay);

  const results = useQuery(GET_TOKEN_METADATA_BLOCK_BASED_QUERY, {
    variables: { id: hashOrId, blockNum },
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!hashOrId) {
      return;
    }
    if (!data) {
      return undefined;
    }
    if (!data.hash) {
      if (TX_HASH_REGEX.test(hashOrId)) {
        return hashOrId;
      }
      return undefined;
    }
    // TODO: check if this works
    return data.hash.hash as string;
  }, [data]);
};
