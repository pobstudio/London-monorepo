import { gql, useQuery } from '@apollo/client';
import { useLastTruthyValue } from './useLastTruthyValue';
import { utils } from 'ethers';
import { useBlockchainStore } from '../stores/blockchain';
import { useMemo } from 'react';

const GET_LONDON_TOKEN_SUPPLY_BLOCK_BASED_QUERY = gql`
  query GetLondonTotalSupply($blockNum: Int!) {
    token(id: "LONDON", block: { number: $blockNum }) {
      id
      totalSupply
    }
  }
`;

export const useTotalSupply = () => {
  const blockNum = useBlockchainStore((s) => !!s.blockNumber ? s.blockNumber - 5 : 0);

  const results = useQuery(GET_LONDON_TOKEN_SUPPLY_BLOCK_BASED_QUERY, {
    variables: { blockNum },
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (!data.token) {
      return undefined;
    }
    return utils.parseUnits(data.token.totalSupply, 'wei');
  }, [data]);
};
