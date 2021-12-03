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
import { useLondonContract, useNFTContract } from './useContracts';
import { deployments } from '@pob/protocol';
import { CHAIN_ID, MAX_APPROVAL } from '../constants';

export const useSetApprove = () => {
  const { account } = useWeb3React();
  const london = useLondonContract();

  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [error, setError] = useState<any | undefined>(undefined);

  const approve = useCallback(async () => {
    if (!account || !london) {
      return;
    }
    try {
      const res = await london.approve(
        deployments[CHAIN_ID].embersMinter,
        MAX_APPROVAL,
      );

      addTransaction(res.hash, {
        type: 'approval',
      });
      setError(undefined);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [london, account]);

  const tx = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) => !tx.lastBlockNumChecked && tx.metadata.type === 'approval',
    );
    const updatedTxs = Object.values(transactionMap)
      .filter(
        (tx) => !!tx.lastBlockNumChecked && tx.metadata.type === 'approval',
      )
      .sort(
        (a, b) =>
          (b.lastBlockNumChecked as number) - (a.lastBlockNumChecked as number),
      );
    const possibleTxs = [...justAddedTxs, ...updatedTxs];
    return possibleTxs[0];
  }, [transactionMap]);

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  return useMemo(
    () => ({
      txStatus,
      approve,
      tx,
      error,
    }),
    [approve, txStatus, tx, error],
  );
};

export const useSetNFTApprove = (address: string | undefined) => {
  const { account } = useWeb3React();
  const nft = useNFTContract(address);

  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [error, setError] = useState<any | undefined>(undefined);

  const approve = useCallback(async () => {
    if (!account || !nft || !address) {
      return;
    }
    try {
      const res = await nft.setApprovalForAll(
        deployments[CHAIN_ID].embersMinter,
        true,
      );

      addTransaction(res.hash, {
        type: 'approval-nft',
        address,
      });
      setError(undefined);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [nft, address, account]);

  const tx = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) =>
        !tx.lastBlockNumChecked &&
        tx.metadata.type === 'approval-nft' &&
        tx.metadata.address === address,
    );
    const updatedTxs = Object.values(transactionMap)
      .filter(
        (tx) =>
          !!tx.lastBlockNumChecked &&
          tx.metadata.type === 'approval-nft' &&
          tx.metadata.address === address,
      )
      .sort(
        (a, b) =>
          (b.lastBlockNumChecked as number) - (a.lastBlockNumChecked as number),
      );
    const possibleTxs = [...justAddedTxs, ...updatedTxs];
    return possibleTxs[0];
  }, [transactionMap, address]);

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );

  return useMemo(
    () => ({
      txStatus,
      approve,
      tx,
      error,
    }),
    [approve, txStatus, tx, error],
  );
};
