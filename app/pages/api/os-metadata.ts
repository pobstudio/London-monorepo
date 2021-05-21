import { deployments } from '@pob/protocol';
import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CHAIN_ID,
  NULL_ADDRESS,
  OPENSEA_API_KEY,
  HASH_PROD_LINK,
  ZERO,
} from '../../constants';

const OPENSEA_URL = (id: string, forceUpdate: boolean = false) =>
  `https://api.opensea.io/api/v1/asset/${deployments[CHAIN_ID].erc1155}/${id}?force_update=${forceUpdate}`;

const handleOsMetadata = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, update } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }

  const idBN = BigNumber.from(id);
  const headers = new Headers({
    'X-API-KEY': OPENSEA_API_KEY || '',
  });
  const osRes = await fetch(OPENSEA_URL(idBN.toString(), update === 'true'), {
    headers,
  });
  if (osRes.ok) {
    res.status(200).json({
      os: await osRes.json(),
      statusCode: 200,
    });
    return;
  } else {
    res.status(200).json({
      statusCode: 200,
      message: 'os call failed.',
    });
  }
};

export default handleOsMetadata;
