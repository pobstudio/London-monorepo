import { NextApiRequest, NextApiResponse } from 'next';
import {
  OPENSEA_API_KEY,
  HASH_CONTRACT,
  LONDON_GIFT_CONTRACT,
  LONDON_EMBERS_CONTRACT,
  SELECTABLE_FOREGROUND,
} from '../../constants';
import { ADDRESS_REGEX } from '../../utils/regex';

const OS_OWNER_ASSETS = (owner: string, limit: number = 50) =>
  `https://api.opensea.io/api/v1/assets?owner=${owner}&limit=${limit}&offset=0`;

const OS_OWNER_FILTER_ASSETS = (owner: string, contracts: string[]) => {
  let link = OS_OWNER_ASSETS(owner);
  contracts.forEach(
    (contract: string) =>
      (link = `${link}&asset_contract_addresses=${contract}`),
  );
  return link;
};

const handleOtherCollection = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { owner } = req.query;
  if (typeof owner !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'owner is not a valid value' });
    return;
  }
  if (!ADDRESS_REGEX.test(owner as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'owner is not a valid value' });
    return;
  }
  let collection: any[] = [];
  let shouldTryNextPage = true;
  const pageLimit = 50;
  let page = 0;
  while (shouldTryNextPage) {
    const headers = new Headers({
      'X-API-KEY': OPENSEA_API_KEY ?? '',
    });

    const openseaRes = await fetch(
      OS_OWNER_FILTER_ASSETS(
        owner,
        SELECTABLE_FOREGROUND.map((i) => i[0]),
      ),
      {
        headers,
      },
    );
    if (openseaRes.ok) {
      const { assets } = await openseaRes.json();
      collection = [...collection, ...assets];
      if (assets.length < pageLimit) {
        shouldTryNextPage = false;
      } else {
        page += pageLimit;
      }
    } else {
      shouldTryNextPage = false;
      res.status(500).json({
        statusCode: 500,
        message: 'internal error fetching account assets',
      });
      return;
    }
  }
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=120, max-age=120, stale-while-revalidate=120`,
  );
  res.status(200).json({
    statusCode: 200,
    collection,
  });
};

export default handleOtherCollection;
