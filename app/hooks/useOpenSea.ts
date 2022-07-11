import { deployments } from '@pob/protocol';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { zdk } from '../clients/zdk';
import { CHAIN_ID, HASH_CONTRACT, LONDON_GIFT_CONTRACT } from '../constants';
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

const OS_LIMIT_DEFAULT = 50;

const OS_OWNER_ASSETS = (owner: string, limit: number = OS_LIMIT_DEFAULT) =>
  `https://api.opensea.io/api/v1/assets?owner=${owner}&limit=${limit}&offset=0`;

const OS_OWNER_FILTER_ASSETS = (owner: string, contracts: string[]) => {
  let link = OS_OWNER_ASSETS(owner);
  contracts.forEach(
    (contract: string) =>
      (link = `${link}&asset_contract_addresses=${contract}`),
  );
  return link;
};

const OS_OWNER_POB_ASSETS = (owner: string) =>
  OS_OWNER_FILTER_ASSETS(owner, [
    LONDON_GIFT_CONTRACT,
    HASH_CONTRACT,
    deployments[CHAIN_ID].embers,
  ]);

const OS_OWNER_LONDON_ASSETS = (owner: string) =>
  OS_OWNER_FILTER_ASSETS(owner, [
    deployments[CHAIN_ID].gift,
    deployments[CHAIN_ID].embers,
  ]);

const OS_OWNER_PUNK_ASSETS = (
  owner: string,
  limit: number = OS_LIMIT_DEFAULT,
) =>
  `https://api.opensea.io/api/v1/assets?owner=${owner}&limit=${limit}&offset=0&collection=cryptopunks`;

export interface OPENSEA_ASSET {
  name: string;
  image: string;
  id: string;
  metadata: string;
  link: string;
}
export interface OPENSEA_COLLECTION {
  name: string;
  contract: string;
  avatar: string;
  url: string;
  assets: OPENSEA_ASSET[];
}

const useOpenSeaAssets = (data: any) => {
  const assets = data?.assets ?? data?.collection;
  let collections: OPENSEA_COLLECTION[] = [];
  assets?.forEach((asset: any) => {
    const contract = asset?.asset_contract?.address;
    const collectionInList = collections.find(
      (collection) => collection?.contract === contract,
    );
    if (collectionInList) {
      const index = collections.findIndex(
        (collection) => collection?.contract === contract,
      );
      collections[index].assets.push({
        name: asset?.name,
        image: asset?.image_url,
        id: asset?.token_id,
        metadata: asset?.token_metadata,
        link: asset?.permalink,
      });
    } else {
      const name = asset?.collection?.name;
      const avatar = asset?.collection?.image_url;
      const url = `https://opensea.io/collection/${asset?.collection?.slug}`;
      collections.push({
        name,
        contract,
        avatar,
        url,
        assets: [
          {
            name: asset?.name,
            image: asset?.image_url,
            id: asset?.token_id,
            metadata: asset?.token_metadata,
            link: asset?.permalink,
          },
        ],
      });
    }
  });

  return collections;
};

export const usePunkAssets = (owner: string): OPENSEA_COLLECTION[] => {
  const fetchUrl = OS_OWNER_PUNK_ASSETS(owner);
  const { data } = useSWR(fetchUrl, fetcher, {});
  return useOpenSeaAssets(data);
};

export const usePobAssets = (owner: string): OPENSEA_COLLECTION[] => {
  const { data } = useSWR(`/api/collections?owner=${owner}`, fetcher, {});
  return useOpenSeaAssets(data);
};

export const useLondonAssets = (owner: string): OPENSEA_COLLECTION[] => {
  const fetchUrl = OS_OWNER_LONDON_ASSETS(owner);
  const { data } = useSWR(fetchUrl, fetcher, {});
  return useOpenSeaAssets(data);
};

export const useOtherAssets = (
  owner: string,
  contracts: string[],
): OPENSEA_COLLECTION[] => {
  const { data } = useSWR(
    useMemo(() => `/api/other-collections?owner=${owner}`, [owner]),
    fetcher,
    {},
  );

  return [...useOpenSeaAssets(data), ...usePunkAssets(owner)];
};
