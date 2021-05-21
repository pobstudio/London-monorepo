import { deployments } from '@pob/protocol';
import { BigNumber } from 'ethers';
import { CHAIN_ID, PREVIEW_IMAGE_LINK } from '../constants';
import { PREVIEW_ROUTES } from '../constants/routes';
import qs from 'query-string';

export const getOpenSeaUrl = (tokenId: string) => {
  return `https://${CHAIN_ID === 1 ? '' : 'testnets.'}opensea.io/assets/${
    deployments[CHAIN_ID].erc1155
  }/${BigNumber.from(tokenId).toString()}`;
};

export const getOpenSeaAccountUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'testnets.'
  }opensea.io/accounts/${address}`;
};

export const getEtherscanTxUrl = (txhash: string) => {
  return `https://${CHAIN_ID === 1 ? '' : 'rinkeby.'}etherscan.io/tx/${txhash}`;
};

export const getEtherscanAddressUrl = (address: string) => {
  return `https://${
    CHAIN_ID === 1 ? '' : 'rinkeby.'
  }etherscan.io/address/${address}`;
};
export const getArtworkPreviewUrl = (hash: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.ART}?hash=${hash}`;
};

export const getMintedArtworkPreviewUrl = (hash: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.MINTED_ART}?id=${hash}`;
};

export const getPrintedArtworkPreviewUrl = (id: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.PRINTED_ART}?id=${id}`;
};

export const getDefaultPreviewUrl = (
  hash: string,
  title: string,
  subtitle?: string,
) => {
  const qsObject = {
    hash,
    title,
    subtitle,
  };
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.DEFAULT}?${qs.stringify(
    qsObject,
  )}`;
};

export const getPalletePreviewUrl = (address: string) => {
  return `${PREVIEW_IMAGE_LINK}${PREVIEW_ROUTES.PALETTE}?address=${address}`;
};
