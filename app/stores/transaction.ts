import create from 'zustand';
import produce from 'immer';
import { TransactionReceipt } from '@ethersproject/providers';
import { useToastsStore } from './toasts';
import { SagaMinterType } from './tokens/saga';

export type TransactionStatus = 'in-progress' | 'success' | 'failed';

export interface GenesisMintingTransactionMetadata {
  type: 'genesis-minting';
  attemptedEdition: number;
  hash: string;
}

export interface SagaBatchMintingTransactionMetadata {
  type: 'saga-batch-minting';
  hashes: string[];
  minter: SagaMinterType;
}

export interface UpdatingTokenMetadataTransactionMetadata {
  tokenId: string;
  type: 'updating-token-metadata';
}

export type TransactionMetadata =
  | GenesisMintingTransactionMetadata
  | SagaBatchMintingTransactionMetadata
  | UpdatingTokenMetadataTransactionMetadata;

export interface TransactionObject {
  hash: string;
  status: TransactionStatus;
  metadata: TransactionMetadata;
  receipt?: TransactionReceipt;
  lastBlockNumChecked?: number;
}

export type TransactionMap = { [hash: string]: TransactionObject };

type State = {
  transactionMap: TransactionMap;
  updateTransactionMap: (updateFn: (update: any) => void) => void;
  addTransaction: (hash: string, metadata: TransactionMetadata) => void;
};

export const useTransactionsStore = create<State>((set, get) => ({
  transactionMap: {},
  updateTransactionMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.transactionMap);
      }),
    );
  },
  addTransaction: (hash: string, metadata: TransactionMetadata) => {
    get().updateTransactionMap((u) => {
      u[hash] = {
        hash,
        status: 'in-progress',
        metadata,
      } as TransactionObject;
    });
  },
}));
