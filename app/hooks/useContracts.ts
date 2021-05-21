import {
  deployments,
  ERC1155Mintable__factory,
  SagaHistoricMinter__factory,
  SagaPersonalMinter__factory,
} from '@pob/protocol';
import {
  TokenMetadataRegistry__factory,
  GenesisMinter__factory,
} from '@pob/protocol';
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

export const useSagaPersonalContract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return SagaPersonalMinter__factory.connect(
      deployments[CHAIN_ID].sagaPersonalMinter,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useSagaHistoricContract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return SagaHistoricMinter__factory.connect(
      deployments[CHAIN_ID].sagaHistoricMinter,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useGenesisContract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return GenesisMinter__factory.connect(
      deployments[CHAIN_ID].genesisMinter,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useErc1155Contract = (shouldUseFallback: boolean = false) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return ERC1155Mintable__factory.connect(
      deployments[CHAIN_ID].erc1155,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};

export const useTokenMetadataContract = (
  shouldUseFallback: boolean = false,
) => {
  const { account } = useWeb3React();
  const provider = useProvider(shouldUseFallback);

  return useMemo(() => {
    if (!account && !provider) {
      return;
    }

    return TokenMetadataRegistry__factory.connect(
      deployments[CHAIN_ID].metadataRegistry,
      getProviderOrSigner(provider as JsonRpcProvider, account as string),
    );
  }, [account, provider]);
};
