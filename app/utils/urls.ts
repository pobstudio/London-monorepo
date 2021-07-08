import { deployments } from '@pob/protocol';
import { BigNumber } from 'ethers';
import { CHAIN_ID } from '../constants';
import qs from 'query-string';

export const getOpenSeaAccountUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/accounts/${address}`;
};

export const getEtherscanTxUrl = (txhash: string) => {
  return `https://${CHAIN_ID === 1 ? '' : 'rinkeby.'}etherscan.io/tx/${txhash}`;
};

export const getEtherscanTokenUrl = (txhash: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'rinkeby.'
  }etherscan.io/token/${txhash}`;
};

export const getEtherscanAddressUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'rinkeby.'
  }etherscan.io/address/${address}`;
};

// export const getArtworkPreviewUrl = (hash: string) => {
//   return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.ART}?hash=${hash}`;
// };
