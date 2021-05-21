import { DEFAULT_SEASON } from '../stores/season';
import { Season } from '@pob/common';

export const fetchPrerenderWithFailsafe = async (
  season: Season = DEFAULT_SEASON,
  txHash: string,
) => {
  console.log(season, txHash);
  const result = await fetch(`/api/${season}/prerender?hash=${txHash}`);

  if (result.status === 200) {
    return await result.clone().json();
  }

  if (result.status === 404) {
    return null;
  }
};
