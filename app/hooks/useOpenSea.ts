import { useMemo } from 'react';
import useSWR from 'swr';
import { HASH_CONTRACT, LONDON_GIFT_CONTRACT } from '../constants';
import { fetcher } from '../utils/fetcher';

const OS_SINGLE_ASSET = (contract: string, token: string) =>
  `https://api.opensea.io/api/v1/asset/${contract}/${token}`;
const LONDON_OS_ASSET = OS_SINGLE_ASSET(
  '0x7645eec8bb51862a5aa855c40971b2877dae81af',
  '7',
);

export const useOpenSeaStats = () => {
  const { data } = useSWR(LONDON_OS_ASSET, fetcher, {});
  const stats = data?.collection?.stats;
  const total_volume = stats?.total_volume;
  const total_sales = stats?.total_sales;
  const total_mints = stats?.total_supply;
  const avg_price = stats?.average_price;
  const num_owners = stats?.num_owners;
  const floor_price = stats?.floor_price;
  const market_cap = stats?.market_cap;
  return useMemo(
    () => ({
      total_volume,
      total_sales,
      total_mints,
      avg_price,
      num_owners,
      floor_price,
      market_cap,
    }),
    [stats],
  );
};

const OS_LIMIT_DEFAULT = 30;

const OS_OWNER_ASSETS = (owner: string, limit: number = OS_LIMIT_DEFAULT) =>
  `https://api.opensea.io/api/v1/assets?owner=${owner}&limit=${limit}&exclude_currencies=true&offset=0`;

const OS_OWNER_FILTER_ASSETS = (
  owner: string,
  limit: number = OS_LIMIT_DEFAULT,
  contracts: string[],
) => {
  let link = OS_OWNER_ASSETS(owner, limit);
  contracts.forEach(
    (contract: string) =>
      (link = `${link}&asset_contract_addresses=${contract}`),
  );
  return link;
};

const OS_OWNER_POB_ASSETS = (owner: string, limit: number = OS_LIMIT_DEFAULT) =>
  OS_OWNER_FILTER_ASSETS(owner, limit, [LONDON_GIFT_CONTRACT, HASH_CONTRACT]);
