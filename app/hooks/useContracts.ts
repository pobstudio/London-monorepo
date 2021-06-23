import { deployments, GasPriceBasedMinter__factory } from '@pob/protocol';
import { useMemo } from 'react';
import { CHAIN_ID } from '../constants';
import { getProviderOrSigner } from '../utils/provider';
import { JsonRpcProvider } from '@ethersproject/providers';
import { useProvider } from './useProvider';
import { useWeb3React } from '@web3-react/core';

// export const usePobContract = (shouldUseFallback: boolean = false) => {
//   const { account } = useWeb3React();
//   const provider = useProvider(shouldUseFallback);

//   return useMemo(() => {
//     if (!account && !provider) {
//       return;
//     }

//     return POBMinterFactory.connect(
//       deployments[CHAIN_ID].pobMinterV2,
//       getProviderOrSigner(provider as JsonRpcProvider, account as string),
//     );
//   }, [account, provider]);
// };

// export const usePobContractV1 = (shouldUseFallback: boolean = false) => {
//   const { account } = useWeb3React();
//   const provider = useProvider(shouldUseFallback);

//   return useMemo(() => {
//     if (!account && !provider) {
//       return;
//     }

//     return POBMinterFactory.connect(
//       deployments[CHAIN_ID].pobMinter,
//       getProviderOrSigner(provider as JsonRpcProvider, account as string),
//     );
//   }, [account, provider]);
// };

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
