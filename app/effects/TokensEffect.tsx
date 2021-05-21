import { useEffect, useMemo } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useState, FC } from 'react';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';
import { useSagaStore } from '../stores/tokens/saga';

export const TokensEffect: FC = () => {
  // const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  // const season = useSeasonStore((s) => s.currentSeason);
  const setMaxIndex = useSagaStore((s) => s.setMaxIndex);

  const { data: maxIndexMapData } = useSWR(
    useMemo(() => `/api/saga/max-index?blockNum=${blockNumber}}`, [
      blockNumber,
    ]),
    fetcher,
  );
  useEffect(() => {
    if (!maxIndexMapData || !maxIndexMapData.maxIndexMap) {
      return;
    }
    const { maxIndexMap } = maxIndexMapData;
    setMaxIndex('personal', maxIndexMap.personal);
    setMaxIndex('historic', maxIndexMap.historic);
  }, [maxIndexMapData]);
  return <></>;
};
