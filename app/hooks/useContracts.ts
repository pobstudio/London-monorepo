import {
  deployments,
  ERC20Mintable__factory,
  GasPriceBasedMinter__factory,
  LondonGift__factory,
  LondonBurnMinter__factory,
} from '@pob/protocol';
import { useMemo } from 'react';
import { CHAIN_ID } from '../constants';
import { getProviderOrSigner } from '../utils/provider';
import { JsonRpcProvider } from '@ethersproject/providers';
import { useProvider } from './useProvider';
import { useWeb3React } from '@web3-react/core';

export const useLondonContract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return ERC20Mintable__factory.connect(
      deployments[CHAIN_ID].erc20,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useLondonGiftContract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return LondonGift__factory.connect(
      deployments[CHAIN_ID].gift,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useMinterContract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return GasPriceBasedMinter__factory.connect(
      deployments[CHAIN_ID].minter,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useLondonEmbersMinterContract = (
  shouldUseFallback: boolean = false,
) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return LondonBurnMinter__factory.connect(
      deployments[CHAIN_ID].embersMinter,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};
