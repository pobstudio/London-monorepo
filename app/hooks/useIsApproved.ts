import { useProvider } from './useProvider';
import { useWeb3React } from '@web3-react/core';
import { useBlockchainStore } from '../stores/blockchain';
import { useCallback } from 'react';
import { useTokensStore } from '../stores/token';
import { useMemo } from 'react';
import { MINT_PRICE } from '../constants/parameters';
import { BigNumber } from '@ethersproject/bignumber';
import { useLondonGiftContract, useLondonEmbersContract } from './useContracts';
import { useTransactionsStore } from '../stores/transaction';
import { useState } from 'react';
import { deployments } from '@pob/protocol';
import { CHAIN_ID } from '../constants';
import { useEffect } from 'react';

export const useIsApproved = (amount?: BigNumber) => {
  const allowance = useTokensStore((s) => s.approvalBalance);
  return useMemo(
    () => allowance.gte(amount ?? MINT_PRICE),
    [amount, allowance],
  );
};

export const useGiftAndEmbersIsApproved = (account: string | undefined) => {
  const gift = useLondonGiftContract();
  const embers = useLondonEmbersContract();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [isEmbersApproved, setIsEmbersApproved] = useState<boolean | undefined>(
    undefined,
  );
  const [isGiftApproved, setIsGiftApproved] = useState<boolean | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!embers || !gift) {
      return;
    }
    if (!account) {
      return;
    }
    embers
      .isApprovedForAll(account, deployments[CHAIN_ID].embersMinter)
      .then(setIsEmbersApproved);
    gift
      .isApprovedForAll(account, deployments[CHAIN_ID].embersMinter)
      .then(setIsGiftApproved);
  }, [gift, account, embers, transactionMap, blockNumber]);

  return [isGiftApproved, isEmbersApproved];
};
