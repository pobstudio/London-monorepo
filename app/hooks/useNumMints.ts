import { gql, useQuery } from '@apollo/client';
import { useLastTruthyValue } from './useLastTruthyValue';
import { BigNumber, utils } from 'ethers';
import { useBlockchainStore } from '../stores/blockchain';
import { useMemo } from 'react';

const GET_LONDON_NUM_MINTS_BY_GAS_PRICE_BLOCK_BASED_QUERY = gql`
  query GetLondonTotalSupply($gasPriceId: String!, $blockNum: Int!) {
    tokenMint(id: $gasPriceId, block: { number: $blockNum }) {
      id
      gasPrice
      numMints
    }
  }
`;

export const useNumMints = (gasPrice: BigNumber | undefined) => {
  const blockNum = useBlockchainStore((s) => s.blockNumber);

  const results = useQuery(
    GET_LONDON_NUM_MINTS_BY_GAS_PRICE_BLOCK_BASED_QUERY,
    {
      variables: { gasPriceId: gasPrice?.toString(), blockNum },
    },
  );

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!gasPrice) {
      return undefined;
    }
    if (!data) {
      return undefined;
    }
    if (!data.tokenMint) {
      return undefined;
    }
    return parseInt(data.tokenMint.numMints);
  }, [gasPrice, data]);
};
