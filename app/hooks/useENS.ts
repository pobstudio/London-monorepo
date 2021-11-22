import { useState, useEffect, useMemo } from 'react';
import { shortenHexString } from '../utils/hex';
import { useProvider } from './useProvider';

export const useENSLookup = (address?: string | undefined | null) => {
  const provider = useProvider(true);
  const [ensName, setEnsName] = useState<string | undefined | null>(undefined);

  useEffect(() => {
    if (!address || !provider) {
      return;
    }
    provider.lookupAddress(address).then(setEnsName);
  }, [provider, setEnsName, address]);

  const result = useMemo(() => ensName, [ensName, address]);
  return result;
};

export const useENSorHex = (
  address?: string | undefined | null,
  defaultText?: string,
): string => {
  const ens = useENSLookup(address);
  const text = useMemo(() => {
    if (!address) {
      return defaultText ?? '';
    }
    return ens ?? shortenHexString(address ?? '');
  }, [address, defaultText, ens]);
  return text;
};
