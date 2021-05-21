import { getEditionFromTokenId } from './token';

export const getDefaultTitle = (tokenId: string, maxMintingSupply: number) => {
  const n = getEditionFromTokenId(tokenId);
  return `NO. ${!n ? '-' : `${n}`} / ${maxMintingSupply}`;
};
