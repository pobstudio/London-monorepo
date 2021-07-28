import { useProvider } from './useProvider';
import { useWeb3React } from '@web3-react/core';
import { useBlockchainStore } from '../stores/blockchain';
import { useCallback } from 'react';
import { useTokensStore } from '../stores/token';
import { useMemo } from 'react';
import { MINT_PRICE } from '../constants/parameters';

export const useIsApproved = () => {
  const allowance = useTokensStore((s) => s.approvalBalance);
  return useMemo(() => allowance.gte(MINT_PRICE), [allowance]);
};
