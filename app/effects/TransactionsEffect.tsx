import { useEffect, useMemo } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useState, FC } from 'react';
import { useTransactionsStore } from '../stores/transaction';
import { useWeb3React } from '@web3-react/core';
import { useToastsStore } from '../stores/toasts';
import { useProvider } from '../hooks/useProvider';
import { useAnalytics } from 'use-analytics';
import { ANALYTIC_EVENTS } from '../constants/analytics';
export const TransactionsEffect: FC = () => {
  const { track } = useAnalytics();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { account, chainId } = useWeb3React();
  const provider = useProvider(true);
  const { transactionMap, updateTransactionMap } = useTransactionsStore();
  const addTxToast = useToastsStore((s) => s.addTxToast);

  useEffect(() => {
    if (!account || !chainId || !blockNumber || !provider) {
      return;
    }
    // TODO: worth changing to an await transation model
    for (const transaction of Object.values(transactionMap)) {
      if (transaction.status === 'in-progress') {
        provider
          .getTransactionReceipt(transaction.hash)
          .then((receipt) => {
            if (receipt) {
              updateTransactionMap((draft) => {
                draft[transaction.hash].lastBlockNumChecked = blockNumber;
                draft[transaction.hash].receipt = receipt;
                draft[transaction.hash].status =
                  receipt.status === 1 ? 'success' : 'failed';
              });
              addTxToast(
                transaction.hash,
                blockNumber,
                receipt.status === 1 ? 'success' : 'failed',
              );
              if (receipt.status !== 1) {
                track(ANALYTIC_EVENTS.APP_MINTING_FAILED, {
                  hash: transaction.hash,
                });
              }
            } else {
              updateTransactionMap((draft) => {
                draft[transaction.hash].lastBlockNumChecked = blockNumber;
              });
            }
          })
          .catch((error) => {
            console.error(
              `failed to check transaction hash: ${transaction.hash}`,
              error,
            );
          });
      }
    }
  }, [provider, blockNumber, track, account, chainId]);

  return <></>;
};
