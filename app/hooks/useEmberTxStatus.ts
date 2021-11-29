import { Transaction } from '@apollo/client';
import { useMemo } from 'react';
import { TokenType } from '../constants/parameters';
import { TransactionStatus, useTransactionsStore } from '../stores/transaction';

export const useEmberTxStatus = (tokenType: TokenType) => {
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const tx = useMemo(() => {
    const justAddedTxs = Object.values(transactionMap).filter(
      (tx) =>
        !tx.lastBlockNumChecked &&
        tx.metadata.type === 'embers-minting' &&
        tx.metadata.tokenType === tokenType,
    );
    const updatedTxs = Object.values(transactionMap)
      .filter(
        (tx) =>
          !!tx.lastBlockNumChecked &&
          tx.metadata.type === 'embers-minting' &&
          tx.metadata.tokenType === tokenType,
      )
      .sort(
        (a, b) =>
          (b.lastBlockNumChecked as number) - (a.lastBlockNumChecked as number),
      );
    const possibleTxs = [...justAddedTxs, ...updatedTxs];
    return possibleTxs[0];
  }, [transactionMap, tokenType]);

  const txStatus: TransactionStatus | undefined = useMemo(
    () => tx?.status,
    [tx],
  );
  return useMemo(() => {
    return {
      tx,
      txStatus,
    };
  }, [tx, txStatus]);
};
