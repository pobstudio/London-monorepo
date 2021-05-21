import { useMemo, useEffect, useState } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionResponse } from './useTransaction';

export const MIN_BLOCK_CONFIRMATIONS = 30;

export const useIsTxTooRecent = (hash: string | undefined) => {
  const hashTxMetadata = useTransactionResponse(hash);
  const mainnetBlockNumber = useBlockchainStore((s) => s.mainnetBlockNumber);

  const [blockConfirmations, setBlockConfirmations] = useState(
    MIN_BLOCK_CONFIRMATIONS + 1,
  );

  useEffect(() => {
    if (!mainnetBlockNumber) {
      return;
    }
    if (!hashTxMetadata) {
      return;
    }
    setBlockConfirmations(
      mainnetBlockNumber - (hashTxMetadata.blockNumber ?? mainnetBlockNumber),
    );
  }, [hashTxMetadata, mainnetBlockNumber]);

  return useMemo(() => blockConfirmations <= MIN_BLOCK_CONFIRMATIONS, [
    blockConfirmations,
  ]);
};
