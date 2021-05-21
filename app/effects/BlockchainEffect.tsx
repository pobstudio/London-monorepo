import { BigNumber } from 'ethers';
import { chain } from 'lodash';
import { useEffect } from 'react';
import { FC } from 'react';
import { useMountedState } from 'react-use';
import { ALCHEMY_KEY, CHAIN_ID, DRAW_ALCHEMY_KEY } from '../constants';
import { useProvider } from '../hooks/useProvider';
import { useBlockchainStore } from '../stores/blockchain';
import { useToastsStore } from '../stores/toasts';
import { getMainnetProvider } from '../utils/provider';
import { useWeb3React } from '@web3-react/core';

// TODO(dave4506)
export const BlockchainEffect: FC = () => {
  const setBlockNumber = useBlockchainStore((s) => s.setBlockNumber);
  const setMainnetBlockNumber = useBlockchainStore(
    (s) => s.setMainnetBlockNumber,
  );
  const setBalance = useBlockchainStore((s) => s.setBalance);
  const blockNumber = useBlockchainStore((s) => s.blockNumber);

  const provider = useProvider(true);
  const isMounted = useMountedState();
  const { account } = useWeb3React();

  useEffect(() => {
    if (!isMounted() || !provider) {
      return;
    }

    let stale = false;

    // set initial value
    provider.getBlockNumber().then((blockNum: number) => {
      if (!stale) {
        setBlockNumber(blockNum);
      }
    });

    provider.on('block', (blockNum: number) => {
      if (stale) {
      }
      setBlockNumber(blockNum);
    });

    // remove listener when the component is unmounted
    return () => {
      provider.removeAllListeners('block');
      setBlockNumber(undefined);
      stale = true;
    };
  }, [provider, isMounted, setBlockNumber]);

  useEffect(() => {
    if (CHAIN_ID !== 1) {
      return;
    }
    setMainnetBlockNumber(blockNumber);
  }, [setMainnetBlockNumber, blockNumber]);

  useEffect(() => {
    if (!isMounted() || !provider || !account) {
      return;
    }
    provider.getBalance(account).then((v) => {
      setBalance(account, v.toString());
    });
  }, [provider, account, setBalance, blockNumber]);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    if (CHAIN_ID === 1) {
      return;
    }

    const provider = getMainnetProvider();

    let stale = false;

    // set initial value
    provider.getBlockNumber().then((blockNum: number) => {
      if (!stale) {
        setMainnetBlockNumber(blockNum);
      }
    });

    provider.on('block', (blockNum: number) => {
      if (stale) {
      }
      setMainnetBlockNumber(blockNum);
    });

    // remove listener when the component is unmounted
    return () => {
      provider.removeAllListeners('block');
      setMainnetBlockNumber(undefined);
      stale = true;
    };
  }, [isMounted, setMainnetBlockNumber]);
  return <></>;
};
