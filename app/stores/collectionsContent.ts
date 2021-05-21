import create from 'zustand';
import produce from 'immer';
type State = {
  currentIndexMap: { [id: string]: number };
  updateCurrentIndexMap: (id: string, currentIndex: number) => void;
};

export const useCollectionsContentStore = create<State>((set, get) => ({
  currentIndexMap: {},
  updateCurrentIndexMap: (id: string, currentIndex: number) =>
    set(
      produce((u) => {
        u.currentIndexMap[id] = currentIndex;
      }),
    ),
}));
