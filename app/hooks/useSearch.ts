import { useRouter } from 'next/router';
import { useState, useCallback, useMemo } from 'react';
import { useKey } from 'react-use';
import { useAnalytics } from 'use-analytics';
import { ANALYTIC_EVENTS } from '../constants/analytics';
import { ROUTES } from '../constants/routes';
import { useCollectionsStore } from '../stores/collections';
import { TX_HASH_REGEX, ADDRESS_REGEX } from '../utils/regex';
import { useAccountMyTx } from './useAccountMyTx';
import { useWeb3React } from '@web3-react/core';

export const useSearch = () => {
  const { track } = useAnalytics();
  const router = useRouter();
  const { account } = useWeb3React();
  useAccountMyTx(account ?? undefined);

  const [searchTerm, setSearchTerm] = useState('');

  const gasStationHashOrIds = useCollectionsStore(
    (s) => s.collectionHashOrIdMap['gas-station'] ?? [],
  );
  const myTxsHashOrIds = useCollectionsStore(
    useCallback((s) => s.collectionHashOrIdMap[`my-txs/${account}`] ?? [], [
      account,
    ]),
  );

  const handleSearchTerm = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const isValidTxSearch = useMemo(() => {
    return TX_HASH_REGEX.test(searchTerm);
  }, [searchTerm]);

  const isValidAccountSearch = useMemo(() => {
    return ADDRESS_REGEX.test(searchTerm);
  }, [searchTerm]);

  const handleSearch = useCallback(() => {
    let prefixedSearchTerm = searchTerm;
    if (searchTerm.slice(0, 2) !== '0x') {
      prefixedSearchTerm = '0x' + searchTerm;
    }

    if (isValidTxSearch) {
      router.push(`${ROUTES.ART}/${prefixedSearchTerm}`);
    }
    if (isValidAccountSearch) {
      router.push(`${ROUTES.COLLECTION}/my-saga/${prefixedSearchTerm}`);
    }
    // toggleIsOpen();
    setSearchTerm('');
    // track(ANALYTIC_EVENTS.SEARCH_MODAL_CLICK_SEARCH);
  }, [isValidTxSearch, isValidAccountSearch, searchTerm, router]);

  const handleLucky = useCallback(() => {
    const txns =
      myTxsHashOrIds.length === 0 ? gasStationHashOrIds : myTxsHashOrIds;
    if (router.pathname === '/art/[hash]') {
      let randomTx = '';
      let tries = 0;
      while (randomTx === '' || tries < 10) {
        const possibleRandomTx = txns[Math.floor(Math.random() * txns.length)];
        if (router.query.hash !== possibleRandomTx) {
          randomTx = possibleRandomTx;
        }
        tries++;
      }
      router.push(`${ROUTES.ART}/${randomTx}`);
    } else {
      const randomTx = txns[Math.floor(Math.random() * txns.length)];
      router.push(`${ROUTES.ART}/${randomTx}`);
    }

    setSearchTerm('');
    track(ANALYTIC_EVENTS.SEARCH_MODAL_CLICK_FEELING_LUCKY);
  }, [myTxsHashOrIds, gasStationHashOrIds, track]);

  const isShuffleDisabled = useMemo(() => {
    return !gasStationHashOrIds || gasStationHashOrIds.length <= 1;
  }, [myTxsHashOrIds, gasStationHashOrIds]);

  useKey(
    'Enter',
    (e: any) => {
      if (isValidTxSearch || isValidAccountSearch) {
        e.preventDefault();
        handleSearch();
      }
    },
    {},
    [isValidTxSearch, isValidAccountSearch, handleSearch],
  );

  return {
    searchTerm,
    handleSearchTerm,
    handleSearch,
    handleLucky,
    isShuffleDisabled,
  };
};
