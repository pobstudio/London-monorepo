import { useState } from 'react';
import { useEffect } from 'react';
import { FC } from 'react';
import { useMountedState } from 'react-use';
import { isMobile } from 'react-device-detect';
import { useToastsStore } from '../stores/toasts';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../connectors';

export function useEagerConnect() {
  const [tried, setTried] = useState(false);
  const isMounted = useMountedState();
  const { active, activate } = useWeb3React();
  const addStatusToast = useToastsStore((s) => s.addStatusToast);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    const attemptActivate = async () => {
      const isAuthorized = await injected.isAuthorized();
      console.log('isAuthorized', isAuthorized);
      if (isAuthorized) {
        try {
          await activate(injected, undefined, true);
        } catch (e) {
          // HACK to detect error
          if (e.message.includes('Unsupported')) {
            addStatusToast('chain-unsupported', -1, {
              text: 'You are not connected to mainnet, feel free to browse',
            });
          }
        }
        setTried(true);
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    };
    attemptActivate();
  }, [activate, isMounted, tried]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React(); // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const ethereum = window.ethereum;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error);
        });
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error);
          });
        }
      };

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
    return undefined;
  }, [active, error, suppress, activate]);
}

export const EagerConnectEffect: FC = () => {
  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager);
  return <></>;
};
