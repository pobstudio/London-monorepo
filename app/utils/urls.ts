import { deployments } from '@pob/protocol';
import { BigNumber } from 'ethers';
import { CHAIN_ID } from '../constants';
import qs from 'query-string';

export const getOpenSeaAccountUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/accounts/${address}`;
};

export const getRaribleCollectionUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }rarible.com/collection/${address}`;
};

export const getRaribleUserAssetUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }rarible.com/collection/${address}`;
};

export const getOpenSeaAssetUrl = (address: string, tokenId: string = '0') => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/assets/${address}/${tokenId}`;
};

export const getOpenSeaUserAssetUrl = (address: string, asset: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/${address}/${asset}`;
};

export const getOpenSeaCollectionUrl = (name: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/collection/${name}`;
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

export const getIPFSUrl = (cid: string) => {
  return `https://${cid}.ipfs.dweb.link/`;
};

// export const getArtworkPreviewUrl = (hash: string) => {
//   return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.ART}?hash=${hash}`;
// };
