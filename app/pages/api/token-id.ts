import { AlchemyProvider } from '@ethersproject/providers';
import {
  deployments,
  HashRegistry__factory,
  Multicall__factory,
} from '@pob/protocol';
import { BigNumber, ethers } from 'ethers';
import { fromPairs } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'path';
import { ALCHEMY_KEY, CHAIN_ID, DRAW_ALCHEMY_KEY, ZERO } from '../../constants';
import { COLLECTION_METADATA_MAP } from '../../stores/collections';
import { padHexString } from '../../utils/hex';
import { ADDRESS_REGEX } from '../../utils/regex';

const provider = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);

const registry = HashRegistry__factory.connect(
  deployments[CHAIN_ID].hashRegistry,
  provider,
);
const multiCall = Multicall__factory.connect(
  deployments[CHAIN_ID].multicall,
  provider,
);

const handleTokenId = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hashes } = req.query;

  if (typeof hashes !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }
  const hashesArr = hashes.split(',');
  const calls = hashesArr
    .map((h) => registry.interface.encodeFunctionData('txHashToTokenId', [h]))
    .map((callData) => ({
      target: registry.address,
      callData,
    }));

  const callRes = await multiCall.callStatic.aggregate(calls);

  const tokenIdEntries = hashesArr
    .map((id: string, i: number) => {
      return [id, callRes[1][i]];
    })
    .filter(([h, tokenId]) => !BigNumber.from(tokenId).eq(ZERO));

  if (tokenIdEntries.length == 0) {
    res.status(200).json({
      statusCode: 200,
      tokenId: {},
    });
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    tokenIds: fromPairs(tokenIdEntries),
  });
};

export default handleTokenId;
