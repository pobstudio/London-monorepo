import { AlchemyProvider } from '@ethersproject/providers';
import { deployments, LondonGiftFactory } from '@pob/protocol';
import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { CHAIN_ID } from '../../constants';
import { PROVIDER } from '../../constants/providers';

const gift = LondonGiftFactory.connect(deployments[CHAIN_ID].gift, PROVIDER);
const handleTokenIndex = async (req: NextApiRequest, res: NextApiResponse) => {
  const { blockNum } = req.query;

  if (typeof blockNum !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  if (parseInt(blockNum) === NaN || parseInt(blockNum) < 0) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  const tokenIndex = await gift.tokenIndex();

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=60, max-age=60`,
  );
  res.status(200).json({
    statusCode: 200,
    tokenIndex: tokenIndex.toNumber(),
  });
};

export default handleTokenIndex;
