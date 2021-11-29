import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { NULL_SIGNATURE } from '../constants';
import { BURN_NOBLE_AIRDROP_AMOUNT } from '../constants/parameters';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import { AirdropCheckWithAirdropState } from '../types';
import { fetcher } from '../utils/fetcher';
import { useLondonEmbersMinterContract } from './useContracts';

export const useAirdropCheck = (address: string | undefined) => {
  const minter = useLondonEmbersMinterContract();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const { data } = useSWR(
    useMemo(() => (!!address ? `/api/airdrop?to=${address}` : null), [address]),
    fetcher,
  );
  const [numAirdropReceived, setNumAirdropReceived] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (!address) {
      return;
    }
    if (!minter) {
      return;
    }
    minter.receivedAirdropNum(address).then((b) => {
      setNumAirdropReceived(b.toNumber());
    });
  }, [address, minter, transactionMap, blockNumber]);

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (data.signature === NULL_SIGNATURE) {
      return undefined;
    }
    // if (
    //   !!numAirdropReceived &&
    //   numAirdropReceived >= BURN_NOBLE_AIRDROP_AMOUNT[data.nobility]
    // ) {
    //   return undefined;
    // }
    return {
      nobility: data.nobility,
      to: data.to,
      signature: data.signature,
      numAirdropped: numAirdropReceived,
    } as AirdropCheckWithAirdropState;
  }, [data, numAirdropReceived]);
};
