import { useMemo } from 'react';
import { useWindowSize } from 'react-use';
import { BREAKPTS } from '../styles';

export const useAdaptiveDesign = () => {
  const { width } = useWindowSize();
  const isExtraSmallScreen = width <= BREAKPTS.XS;
  const isSmallScreen = width <= BREAKPTS.SM;
  const isMediumScreen = width <= BREAKPTS.MD;
  const isLargeScreen = width <= BREAKPTS.LG;
  const isExtraLargeScreenAndLess = width <= BREAKPTS.XL;
  const isExtraLargeScreen = width >= BREAKPTS.XL;

  const screenSizes = useMemo(() => {
    return {
      isExtraSmallScreen,
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,
      isExtraLargeScreenAndLess,
      isExtraLargeScreen,
    };
  }, [
    width,
    isExtraSmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isExtraLargeScreenAndLess,
    isExtraLargeScreen,
  ]);
  return screenSizes;
};
