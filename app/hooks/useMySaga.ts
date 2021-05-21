import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ROUTES } from '../constants/routes';
import { useModalStore } from '../stores/modal';

export const useMySaga = () => {
  const router = useRouter();
  const { account } = useWeb3React();
  const toggleIsWalletModalOpen = useModalStore(
    (s) => s.toggleIsWalletModalOpen,
  );
  const goToMySaga = useCallback(() => {
    if (!account) {
      toggleIsWalletModalOpen();
    } else {
      router.push(`${ROUTES.COLLECTION}/my-saga/${account}`);
    }
  }, [router, toggleIsWalletModalOpen, account]);
  const goToASaga = useCallback(
    (address: string) => {
      router.push(`${ROUTES.COLLECTION}/my-saga/${address}`);
    },
    [router],
  );

  const goToMyTxs = useCallback(() => {
    if (!account) {
      toggleIsWalletModalOpen();
    } else {
      router.push(`${ROUTES.COLLECTION}/my-txs/${account}`);
    }
  }, [account, router]);

  const goToMyCollection = useCallback(() => {
    if (!account) {
      toggleIsWalletModalOpen();
    } else {
      router.push(`${ROUTES.COLLECTION}/${account}`);
    }
  }, [account, router]);

  return {
    goToMySaga,
    goToASaga,
    goToMyTxs,
    goToMyCollection,
  };
};
