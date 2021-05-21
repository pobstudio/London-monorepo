import seedrandom from 'seedrandom';
import {
  Bound,
  randomRangeFactory,
  colors,
  theme,
  labelValueWithRanges,
  lerp,
  newArray,
} from '../../utils/src';
import { Provider } from '@ethersproject/abstract-provider';

export interface TxData {
  hash: string;
  blockNumber: number;
  leadingZeros: number;
  gasPriceInGwei: number;
  gasUsed: number;
  gasLimit: number;
  valueInEth: number;
  nonce: number;
}

export const generateColorPalleteFromAddress = (address: string) => {
  const lowerCasedAddress = address.toLowerCase();
  const rand = seedrandom(lowerCasedAddress);
  const { randomInArray } = randomRangeFactory(rand);
  const tintColorsIndex = randomInArray(Object.keys(colors));
  const tintColors = !!(theme as any)[lowerCasedAddress as string]
    ? (theme as any)[lowerCasedAddress as string].colors
    : (colors[tintColorsIndex] as [string, string, string, string]);
  return {
    colors: tintColors,
    palleteIndex: !!(theme as any)[lowerCasedAddress as string]
      ? -1
      : tintColorsIndex,
  };
};

export const getTxDataFromProvider = async (
  provider: Provider,
  txHash: string,
) => {
  const response = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!response || !receipt) {
    throw new Error('txHash is not found on Ethereum mainnet');
  }

  return {
    ...response,
    ...receipt,
  };
};
