import create from 'zustand';
import produce from 'immer';

type State = {
  tokenIndex: number;
  setTokenIndex: (tokenIndex: number) => void;
};

export const useGiftStore = create<State>((set, get) => ({
  tokenIndex: 0,
  setTokenIndex: (tokenIndex: number) => {
    set(
      produce((s) => {
        s.tokenIndex = tokenIndex;
      }),
    );
  },
}));
