import { Web3Provider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { getAlwaysAvailProvider } from '../utils/provider';

export const useProvider = (shouldUseFallback: boolean = false) => {
  const { library } = useWeb3React<Web3Provider>();
  return useMemo(
    () => (shouldUseFallback && !library ? getAlwaysAvailProvider() : library),
    [library, shouldUseFallback],
  );
};
