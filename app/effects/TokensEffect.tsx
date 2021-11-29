import { useEffect, useMemo } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useGiftStore } from '../stores/gift';
import { useState, FC } from 'react';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';
import { useTokensStore } from '../stores/token';
import { PROVIDER } from '../constants/providers';
import {
  useLondonContract,
  useLondonGiftContract,
} from '../hooks/useContracts';
import { useWeb3React } from '@web3-react/core';
import { deployments } from '@pob/protocol';
import { CHAIN_ID } from '../constants';
import { useShopState } from '../hooks/useShopState';

export const TokensEffect: FC = () => {
  // const transactionMap = useTransactionsStore((s) => s.transactionMap);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const setApprovalBalance = useTokensStore((s) => s.setApprovalBalance);
  const setTokenBalance = useTokensStore((s) => s.setTokenBalance);
  const setNftMintedAmount = useGiftStore((s) => s.setNftMintedAmount);
  const setTokenIndex = useGiftStore((s) => s.setTokenIndex);
  const { account } = useWeb3React();
  const london = useLondonContract();
  const gift = useLondonGiftContract();

  // const { data: tokenIndexData } = useSWR(
  //   useMemo(() => `/api/token-index?blockNum=${blockNumber}}`, [blockNumber]),
  //   fetcher,
  // );
  // useEffect(() => {
  //   if (!tokenIndexData || !tokenIndexData.tokenIndex) {
  //     return;
  //   }
  //   const { tokenIndex } = tokenIndexData;
  //   setTokenIndex(tokenIndex);
  // }, [tokenIndexData]);

  // const shopState = useShopState();

  useEffect(() => {
    if (!london) {
      return;
    }
    if (!account) {
      return;
    }
    london
      .allowance(account, deployments[CHAIN_ID].embersMinter)
      .then((v: any) => {
        console.log('v', v.toString());
        setApprovalBalance(v);
      });
    london.balanceOf(account).then(setTokenBalance);
  }, [account, london, blockNumber]);

  // useEffect(() => {
  //   if (shopState !== 'preview') {
  //     return;
  //   }
  //   if (!gift) {
  //     return;
  //   }
  //   if (!account) {
  //     return;
  //   }
  //   gift.mintedAmounts(account).then((b) => setNftMintedAmount(b.toNumber()));
  // }, [shopState, account, gift, blockNumber]);

  return <></>;
};
