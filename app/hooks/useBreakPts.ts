import { useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { BreakPts, BREAKPTS } from '../styles';

export const useBreakPts = (): BreakPts | undefined => {
  const { width } = useWindowSize();
  return useMemo(() => {
    if (width < BREAKPTS.SM) {
      return 'SM';
    }
    if (width < BREAKPTS.MD) {
      return 'MD';
    }
    if (width < BREAKPTS.LG) {
      return 'LG';
    }
    if (width < BREAKPTS.XL) {
      return 'XL';
    }
    return undefined;
  }, [width]);
};
