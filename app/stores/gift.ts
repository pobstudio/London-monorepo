import create from 'zustand';
import produce from 'immer';

type State = {
  tokenIndex: number;
  nftMintedAmount: number;
  setTokenIndex: (tokenIndex: number) => void;
  setNftMintedAmount: (nftMintedAmount: number) => void;
};

export const useGiftStore = create<State>((set, get) => ({
  tokenIndex: 8888,
  nftMintedAmount: 0,
  setTokenIndex: (tokenIndex: number) => {
    set(
      produce((s) => {
        s.tokenIndex = tokenIndex;
      }),
    );
  },
  setNftMintedAmount: (nftMintedAmount: number) => {
    set(
      produce((s) => {
        s.nftMintedAmount = nftMintedAmount;
      }),
    );
  },
}));
