import { ethers } from 'ethers';
import create from 'zustand';

type State = {
  maxIndex: number;
  v2MaxIndex: number;
  currentPriceToMintInWei: string;
  setMaxIndex: (maxIndex: number) => void;
};

//Token settings are designed to mimic as if POBMinterV2 is engaged and on top of V1
export const STARTING_PRICE = ethers.utils.parseEther('0.05');
export const FORMATTED_STARTING_PRICE = ethers.utils.formatEther(
  STARTING_PRICE,
);
export const PRICE_PER_MINT = ethers.utils.parseEther('0.001');
export const FORMATTED_PRICE_PER_MINT = ethers.utils.formatEther(
  PRICE_PER_MINT,
);
export const PREVIOUS_TOKEN_TYPE_MAX_INDEX = 55;
export const TOKEN_SYMBOL = 'HASH';
export const MAX_MINTING_SUPPLY = 2555;
export const FLAT_PRICE_UP_TO = 1000;
export const V1_TOKEN_TYPE =
  '0x8000000000000000000000000000000100000000000000000000000000000000';
export const TOKEN_TYPE =
  '0x8000000000000000000000000000000200000000000000000000000000000000';

export const pricingCurve = (index: number) => {
  if (index <= FLAT_PRICE_UP_TO) {
    return STARTING_PRICE;
  } else {
    return PRICE_PER_MINT.mul(index - 1 - FLAT_PRICE_UP_TO).add(STARTING_PRICE);
  }
};

export const getEditionFromGenesisTokenId = (tokenId: string) => {
  return (
    parseInt(tokenId.slice(34), 16) +
    (TOKEN_TYPE.slice(0, 34) === tokenId.slice(0, 34)
      ? PREVIOUS_TOKEN_TYPE_MAX_INDEX
      : 0)
  );
};

export const useGenesisStore = create<State>((set, get) => ({
  currentPriceToMintInWei: '0',
  maxIndex: 2555,
  v2MaxIndex: 2500,
  setMaxIndex: (maxIndex: number) =>
    set({
      v2MaxIndex: maxIndex,
      maxIndex: maxIndex + PREVIOUS_TOKEN_TYPE_MAX_INDEX,
      currentPriceToMintInWei: pricingCurve(maxIndex).toString(),
    }),
}));
