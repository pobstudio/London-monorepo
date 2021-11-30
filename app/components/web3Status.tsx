import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { useRouter } from 'next/dist/client/router';
import { A } from './anchor';
import { useTransactionsStore } from '../stores/transaction';
import { useENSorHex } from '../hooks/useENS';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { injected, walletconnect } from '../connectors';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { usePrevious } from 'react-use';
import { Flex } from './flex';
import { isMobile } from 'react-device-detect';
import { useLoadingText } from '../hooks/useLoadingText';
import { useLondonBalance } from '../hooks/useBalance';
import { utils } from 'ethers';
import { useTokensStore } from '../stores/token';

const AStatus = styled(A)`
  cursor: pointer;
  font-style: italic;
`;

interface WalletInfo {
  connector?: AbstractConnector;
  mobile?: true;
  mobileOnly?: true;
  name: string;
  primary?: boolean;
  description: string;
}

const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    primary: true,
    description: 'Connect via injected provider',
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    description: 'Connect via Metamask',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    mobile: true,
    description: 'Connect via WalletConnect',
  },
  // WALLET_LINK: {
  //   connector: walletlink,
  //   name: 'Coinbase Wallet',
  //   iconName: 'coinbaseWalletIcon.svg',
  //   description: 'Use Coinbase Wallet app on mobile device',
  //   href: null,
  //   color: '#315CF5'
  // },
};

export type WalletState = 'options' | 'connect' | 'account' | 'pending';

export const Web3Status: FC = () => {
  const router = useRouter();
  const { active, activate, account, connector, error, deactivate } =
    useWeb3React();
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [walletView, setWalletView] = useState<WalletState>('connect');

  const numLoadingCount = useMemo(() => {
    return Object.values(transactionMap).reduce(
      (a, tx) => (tx.status === 'in-progress' ? a + 1 : a),
      0,
    );
  }, [transactionMap]);

  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);

  useEffect(() => {
    if (
      (active && !activePrevious) ||
      (connector && connector !== connectorPrevious && !error)
    ) {
      setWalletView('account');
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    activePrevious,
    connectorPrevious,
  ]);

  const ensOrHex = useENSorHex(account);
  const tokenBalance = useTokensStore((s) => s.tokenBalance);

  const buttonText = useMemo(() => {
    if (walletView === 'connect') {
      return 'Connect Wallet';
    }
    if (walletView === 'options') {
      return 'Dismiss';
    }
    if (walletView === 'pending') {
      return 'Loading...';
    }
    if (error) {
      if (error instanceof UnsupportedChainIdError) {
        return 'We need mainnet';
      }
      return 'Something went wrong';
    }
    return ensOrHex;
  }, [error, ensOrHex, walletView]);

  const onClick = useCallback(() => {
    if (walletView === 'connect' || error) {
      setWalletView('options');
    }
    if (walletView === 'options') {
      setWalletView('connect');
    }
    if (walletView === 'pending') {
    }
    if (walletView === 'account') {
    }
  }, [walletView, error]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = '';
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    // log selected wallet
    setWalletView('pending');

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          // setPendingError(true);
        }
        if (connector instanceof WalletConnectConnector) {
          connector.walletConnectProvider = undefined;
        }
      });
  };

  const disconnect = useCallback(() => {
    setWalletView('connect');
    if (connector instanceof WalletConnectConnector) {
      (connector as any).close();
    }
    deactivate();
  }, [connector, router]);

  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {
        if (!window.ethereum && option.mobile) {
          return (
            <AStatus
              key={`wallet-option-${option.name}`}
              onClick={() => {
                option.connector !== connector &&
                  tryActivation(option.connector);
              }}
            >
              {option.name}
            </AStatus>
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!window.ethereum) {
          if (option.name === 'MetaMask') {
            return (
              <AStatus
                key={`wallet-option-install-metamask`}
                onClick={() => window.open('https://metamask.io', '_blank')}
              >
                Install Metamask
              </AStatus>
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <AStatus
            key={`wallet-option-${option.name}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView('account')
                : tryActivation(option.connector);
            }}
          >
            {option.name}
          </AStatus>
        )
      );
    });
  }

  return (
    <AnchorRow>
      {walletView === 'account' && (
        <AStatus style={{ textDecoration: 'none' }} onClick={disconnect}>
          {utils.formatEther(tokenBalance)} $LONDON
        </AStatus>
      )}
      {walletView === 'options' && <>{getOptions()}</>}
      <AStatus onClick={onClick}>
        <span style={{ textDecoration: 'none' }}>
          {walletView === 'pending' ? <Loader /> : buttonText}
        </span>
      </AStatus>
      {walletView === 'account' && (
        <AStatus onClick={disconnect}>Log Out</AStatus>
      )}
    </AnchorRow>
  );
};

const Loader: FC = () => {
  const loadingText = useLoadingText();
  return <>{loadingText}</>;
};

const AnchorRow = styled(Flex)`
  a + a {
    margin-left: 16px;
  }
`;
