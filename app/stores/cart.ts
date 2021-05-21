import create from 'zustand';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';
import { persist } from 'zustand/middleware';
import { GeneWithTxData } from '../sketches/saga';
import { SagaMinterType } from './tokens/saga';

export type State = {
  currentlyMinting: SagaMinterType | undefined;
  setCurrentlyMinting: (s: SagaMinterType | undefined) => void;
  hashMap: { [key: string]: string[] };
  addHashes: (key: string, hashes: string[]) => void;
  removeHashes: (key: string, hashes: string[]) => void;
};

export const getHashesMapKey = (account: string, cartType: SagaMinterType) =>
  `${account}-${cartType}`;

export const useCartStore = create<State>(
  persist(
    (set, get) => ({
      currentlyMinting: undefined,
      setCurrentlyMinting: (s: SagaMinterType | undefined) =>
        set({ currentlyMinting: s }),
      hashMap: {},
      removeHashes: (key: string, hashes: string[]) => {
        set((s) => ({
          hashMap: {
            ...s.hashMap,
            [key]: filter(s.hashMap[key] ?? [], (h) => !hashes.includes(h)),
          },
        }));
      },
      addHashes: (key: string, hashes: string[]) => {
        set((s) => ({
          hashMap: {
            ...s.hashMap,
            [key]: uniq([...(s.hashMap[key] ?? []), ...hashes]),
          },
        }));
      },
    }),
    { name: 'cart-dev' },
  ),
);
