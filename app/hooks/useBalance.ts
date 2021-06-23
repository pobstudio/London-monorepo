import { useMemo } from 'react';
import { useEffect } from 'react';
import { useProvider } from './useProvider';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useLastTruthyValue } from './useLastTruthyValue';
import { utils } from 'ethers';

export const useBalance = () => {
  const provider = useProvider(true);
  const { account } = useWeb3React();
  const balance = useBlockchainStore(
    useCallback((s) => s.balanceMap[account ?? ''], [account]),
  );
  const [localBalance, setLocalBalance] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!provider || !account) {
      return;
    }
    provider.getBalance(account).then((v) => {
      setLocalBalance(v.toString());
    });
  }, [provider, account, setLocalBalance]);

  return useMemo(() => balance ?? localBalance ?? '0', [localBalance]);
};

const GET_LONDON_BALANCE_BY_ADDRESS_BLOCK_BASED_QUERY = gql`
  query GetLondonBalance($address: String!, $blockNum: Int!) {
    tokenOwnership(id: $address, block: { number: $blockNum }) {
      id
      quantity
    }
  }
`;

export const useLondonBalance = (address: string | undefined) => {
  const blockNum = useBlockchainStore((s) => s.blockNumber);

  const results = useQuery(GET_LONDON_BALANCE_BY_ADDRESS_BLOCK_BASED_QUERY, {
    variables: { address, blockNum },
  });

  const data = useLastTruthyValue(results.data);

  return useMemo(() => {
    if (!address) {
      return undefined;
    }
    if (!data) {
      return undefined;
    }
    if (!data.tokenOwnership) {
      return undefined;
    }
    if (data.tokenOwnership.id !== address) {
      return undefined;
    }
    return utils.parseUnits(data.tokenOwnership.quantity, 'wei');
  }, [data]);
};
