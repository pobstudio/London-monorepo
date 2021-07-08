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
import { useMinterContract } from './useContracts';

// export type GenesisMintingStatus = MintingStatus;

export const useMinter = () => {
  const { account } = useWeb3React();
  const minter = useMinterContract();

  const addTransaction = useTransactionsStore((s) => s.addTransaction);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [error, setError] = useState<any | undefined>(undefined);

  const mint = useCallback(
    async (gasPrice?: BigNumber) => {
      if (!account || !minter) {
        return;
      }
      try {
        const res = await minter.fallback({
          gasPrice,
          data: '0x00',
          gasLimit: 70000, // set the gas limit to 70k see if this reduce gas errors
        });

        addTransaction(res.hash, {
          gasPrice,
          type: 'minting',
        });
        setError(undefined);
      } catch (e) {
        console.error(e);
        setError(e);
      }
    },
    [minter, account],
  );

  const tx = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) => !tx.lastBlockNumChecked && tx.metadata.type === 'minting',
    );
    const updatedTxs = Object.values(transactionMap)
      .filter(
        (tx) => !!tx.lastBlockNumChecked && tx.metadata.type === 'minting',
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
    }),
    [mint, txStatus, tx, error],
  );
};
