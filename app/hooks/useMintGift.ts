import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
  TransactionObject,
  TransactionStatus,
  useTransactionsStore,
} from '../stores/transaction';
import eq from 'lodash/eq';
import useSWR from 'swr';
import { sha256 } from '@ethersproject/sha2';
import { difference } from 'lodash';
import { useLondonGiftContract } from './useContracts';
import { deployments } from '@pob/protocol';
import { CHAIN_ID, MAX_APPROVAL } from '../constants';
import { useTokensStore } from '../stores/token';
import { useIsApproved } from './useIsApproved';
import { MINT_PRICE } from '../constants/parameters';
import { useShopState } from './useShopState';

export const useMintGift = () => {
  const { account } = useWeb3React();
  const gift = useLondonGiftContract();
  const shopState = useShopState();
  const tokenBalance = useTokensStore((s) => s.tokenBalance);

  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [error, setError] = useState<any | undefined>(undefined);

  const isApproved = useIsApproved();
  const isEnoughBalance = useMemo(() => tokenBalance.gte(MINT_PRICE), [
    tokenBalance,
  ]);

  const isMintable = useMemo(() => {
    return shopState === 'open' && isApproved && isEnoughBalance;
  }, [shopState, isApproved, isEnoughBalance]);

  const mint = useCallback(
    async (gasPrice?: BigNumber) => {
      if (!account || !gift) {
        return;
      }
      try {
        const res = await gift.mint();

        addTransaction(res.hash, {
          type: 'minting-gift',
        });
        setError(undefined);
      } catch (e) {
        console.error(e);
        setError(e);
      }
    },
    [gift, account],
  );

  const tx = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) => !tx.lastBlockNumChecked && tx.metadata.type === 'minting-gift',
    );
    const updatedTxs = Object.values(transactionMap)
      .filter(
        (tx) => !!tx.lastBlockNumChecked && tx.metadata.type === 'minting-gift',
      )
      .sort(
        (a, b) =>
          (b.lastBlockNumChecked as number) - (a.lastBlockNumChecked as number),
      );
    const possibleTxs = [...justAddedTxs, ...updatedTxs];
    return possibleTxs[0];
  }, [transactionMap]);

  const txStatus: TransactionStatus | undefined = useMemo(() => tx?.status, [
    tx,
  ]);

  return useMemo(
    () => ({
      txStatus,
      mint,
      tx,
      error,
      isMintable,
      isEnoughBalance,
    }),
    [isEnoughBalance, isMintable, gift, txStatus, tx, error],
  );
};
