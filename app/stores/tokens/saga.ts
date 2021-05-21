import { ethers } from 'ethers';
import create from 'zustand';
import produce from 'immer';
import { ZERO } from '../../constants';

type State = {
  maxIndexMap: { [key in SagaMinterType]: number };
  setMaxIndex: (key: SagaMinterType, maxIndex: number) => void;
};

export type SagaMinterType = 'personal' | 'historic';

export interface SignedMint {
  txHash: string;
  dst: string;
  salt: number;
  signature: string;
}

export const PERSONAL_FLAT_PRICE = ethers.utils.parseEther('0.125');
export const HISTORIC_STARTING_PRICE = ethers.utils.parseEther('0.5');
export const HISTORIC_PRICE_PER_MINT = ethers.utils.parseEther('0.001');
export const MAX_MINTING_SUPPLY: { [key in SagaMinterType]: number } = {
  historic: 2303,
  personal: 23333,
};
export const PERSONAL_TOKEN_TYPE =
  '0x8000000000000000000000000000000300000000000000000000000000000000';
export const HISTORIC_TOKEN_TYPE =
  '0x8000000000000000000000000000000400000000000000000000000000000000';

export const pricingCurve = (type: SagaMinterType) => (index: number) => {
  if (type === 'historic') {
    return HISTORIC_STARTING_PRICE.add(HISTORIC_PRICE_PER_MINT.mul(index));
  }
  return PERSONAL_FLAT_PRICE;
};

export const getMinterTypeFromTokenId = (
  tokenId: string,
): SagaMinterType | undefined => {
  const tokenTypePrefixFromTokenId = tokenId.slice(0, 34);
  if (tokenTypePrefixFromTokenId === PERSONAL_TOKEN_TYPE.slice(0, 34)) {
    return 'personal';
  }
  if (tokenTypePrefixFromTokenId === HISTORIC_TOKEN_TYPE.slice(0, 34)) {
    return 'historic';
  }
  return undefined;
};

export const pricingCurveForBatch = (type: SagaMinterType) => (
  currentIndex: number,
  numMints: number,
) => {
  let totalPrice = ZERO;
  for (let i = currentIndex; i < currentIndex + numMints; ++i) {
    totalPrice = totalPrice.add(pricingCurve(type)(i));
  }
  return totalPrice;
};

export const useSagaStore = create<State>((set, get) => ({
  maxIndexMap: {
    historic: 0,
    personal: 0,
  },
  setMaxIndex: (key: SagaMinterType, maxIndex: number) => {
    set(
      produce((s) => {
        s.maxIndexMap[key] = maxIndex;
      }),
    );
  },
}));
