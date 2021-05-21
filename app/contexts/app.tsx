import React, { useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from 'react-use';
import { STUDIO_PROD_LINK } from '../constants';

const BANNER_ENABLED = true;
const BANNER_KEY = 'new-pob-studio';

export interface AppProviderContext {
  isAppBannerVisible: boolean;
  closeAppBanner: () => void;
}

export type AppProviderState = AppProviderContext;

const initialAppState: AppProviderState = {
  isAppBannerVisible: false,
  closeAppBanner: () => new Error('Missing AppProviderState'),
};

const AppContext = React.createContext<AppProviderState>(initialAppState);

const AppProvider: React.FC = ({ children }) => {
  const [
    isAppBannerVisibleLocal,
    setIsAppBannerVisibleLocal,
  ] = useLocalStorage<boolean>(BANNER_KEY, true);

  const isAppBannerVisible = useMemo(() => {
    return BANNER_ENABLED && (isAppBannerVisibleLocal ?? false);
  }, [isAppBannerVisibleLocal]);

  const closeAppBanner = useCallback(() => {
    setIsAppBannerVisibleLocal(false);
  }, [setIsAppBannerVisibleLocal]);

  const appStateObject = useMemo(() => {
    return {
      isAppBannerVisible,
      closeAppBanner,
    };
  }, [isAppBannerVisible, closeAppBanner]);

  return (
    <AppContext.Provider value={appStateObject}>{children}</AppContext.Provider>
  );
};

const useAppContext = (): AppProviderState => {
  return React.useContext(AppContext);
};

export { AppProvider, useAppContext };
