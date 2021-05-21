export const isBrowser = () => typeof window !== 'undefined';

export const getHttpProtocol = () =>
  process.env.NODE_ENV === 'development' ? 'http' : 'https';
