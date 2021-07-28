import { AlchemyProvider } from '@ethersproject/providers';
import { ALCHEMY_KEY, CHAIN_ID } from '.';

export const PROVIDER = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);
