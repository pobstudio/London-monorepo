import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { CHAIN_ID, NULL_ADDRESS, HASH_PROD_LINK, ZERO } from '../../constants';
import { shortenHexString, padHexString } from '../../utils/hex';
import { getEditionFromTokenId } from '../../utils/token';
import { handleGenesisMetadata } from '../../server/token-metadata/genesis';
import { getSeasonFromTokenId } from '@pob/common';
import { handleSagaMetadata } from '../../server/token-metadata/saga';

const handleTokenURI = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }
  const season = getSeasonFromTokenId(id);

  if (season === 'genesis') {
    await handleGenesisMetadata(id, res);
    return;
  }
  if (season === 'saga') {
    await handleSagaMetadata(id, res);
    return;
  }
  res
    .status(404)
    .json({ statusCode: 404, message: 'id not a supported token type' });
};

export default handleTokenURI;
