import { useMemo } from 'react';
import useSWR from 'swr';
import { TokenType } from '../constants/parameters';
import { fetcher } from '../utils/fetcher';

export const useMintCheck = (
  address: string | undefined,
  tokenType: TokenType,
  numChecks: number,
) => {
  const { data } = useSWR(
    useMemo(
      () =>
        !!address
          ? `/api/mint-check?tokenType=${tokenType}&to=${address}&numChecks=${numChecks}`
          : null,
      [address, tokenType, numChecks],
    ),
    fetcher,
  );
  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    return data.mintCheck;
  }, [data]);
};
