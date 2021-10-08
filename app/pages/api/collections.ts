import { deployments } from '@pob/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { OPENSEA_API_KEY } from '../../constants';
import { ADDRESS_REGEX } from '../../utils/regex';

const handleLondonCollection = async (
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
      `https://api.opensea.io/api/v1/assets?owner=${owner}&limit=${pageLimit}&offset=${page}&asset_contract_address=${deployments[1].gift}`,
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
        message: 'internal error fetching account balance',
      });
      return;
    }
  }
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=65536, max-age=65536`,
  );
  res.status(200).json({
    statusCode: 200,
    collection,
  });
};

export default handleLondonCollection;
