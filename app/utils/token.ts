import { getSeasonFromTokenId } from '@pob/common';
import { getEditionFromGenesisTokenId } from '../stores/tokens/genesis';

export const getEditionFromTokenId = (tokenId: string) => {
  const season = getSeasonFromTokenId(tokenId);
  // There is some weird tokenId nuance with season 0, so need to route to a specfic util
  if (season === 'genesis') {
    return getEditionFromGenesisTokenId(tokenId);
  }
  return parseInt(tokenId.slice(34), 16);
};
