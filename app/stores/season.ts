import { Bound } from '../../utils/src';
import { useMemo } from 'react';
import create from 'zustand';
import { useTokenId, useTokenIdFast } from '../hooks/useTokenId';
import { MAX_MINTING_SUPPLY } from './tokens/genesis';
import { Season, getSeasonFromTokenId } from '@pob/common';
import { DIMENSIONS } from '@pob/common';

export const DEFAULT_SEASON: Season = 'saga';

type State = {
  currentSeason: Season;
  setCurrentSeason: (season: Season) => void;
};

export const useSeasonStore = create<State>((set, get) => ({
  currentSeason: DEFAULT_SEASON,
  setCurrentSeason: (season: Season) => {
    set({ currentSeason: season });
  },
}));

export const useSeasonFromHash = (hash: string | undefined) => {
  const tokenId = useTokenId(hash);
  const currentSeason = useSeasonStore((s) => s.currentSeason);
  return useMemo(() => {
    if (!tokenId) {
      return currentSeason;
    }
    return getSeasonFromTokenId(tokenId);
  }, [tokenId, currentSeason]);
};

export const useSeasonFromHashFast = (hash: string | undefined) => {
  const tokenId = useTokenIdFast(hash);
  const currentSeason = useSeasonStore((s) => s.currentSeason);
  return useMemo(() => {
    if (tokenId === undefined) {
      return undefined;
    }
    if (tokenId === null) {
      return currentSeason;
    }
    return getSeasonFromTokenId(tokenId);
  }, [tokenId, currentSeason]);
};
