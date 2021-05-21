import create from 'zustand';
import produce from 'immer';

export const DEFAULT_WIDTH = 600;

type State = {
  largeCardDimensions: [number, number];
  setLargeCardDimensions: (largeCardDimensions: [number, number]) => void;
};

// Store is used to capture some global metadata around cards to save compute cycles
export const useCardStore = create<State>((set) => ({
  largeCardDimensions: [0, 0],
  setLargeCardDimensions: (largeCardDimensions: [number, number]) =>
    set({ largeCardDimensions }),
}));
