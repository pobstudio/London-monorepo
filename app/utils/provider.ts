import {
  JsonRpcProvider,
  JsonRpcSigner,
  AlchemyProvider,
  JsonRpcFetchFunc,
} from '@ethersproject/providers';
import { ALCHEMY_KEY, CHAIN_ID } from '../constants';

const provider = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);

export const getAlwaysAvailProvider = () => {
  return provider;
};

export const getMainnetProvider = () => {
  return provider;
};

// account is not optional
export function getSigner(
  library: JsonRpcProvider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  library: JsonRpcProvider,
  account?: string,
): JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}
