import { AlchemyProvider } from '@ethersproject/providers';
import { deployments, HashRegistry__factory } from '@pob/protocol';
import { BigNumber, ethers } from 'ethers';
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

const handleHash = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hashOrId } = req.query;

  if (typeof hashOrId !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hashOrId is not a valid value' });
    return;
  }
  let hash = '0x0';

  const h = await registry.tokenIdToTxHash(hashOrId);
  if (h.eq(ZERO)) {
    hash = hashOrId;
  } else {
    hash = padHexString(h.toHexString());
  }

  if (BigNumber.from(hash).eq(ZERO)) {
    res.status(200).json({
      statusCode: 200,
      hash: hash,
    });
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    statusCode: 200,
    hash: hash,
  });
};

// const handleHash = async (req: NextApiRequest, res: NextApiResponse) => {
//   const { hashOrIds } = req.query;

//   if (typeof hashOrIds !== 'string') {
//     res
//       .status(422)
//       .json({ statusCode: 422, message: 'hashOrId is not a valid value' });
//     return;
//   }

//   const hashOrIdsArr = hashOrIds.split(',');
//   const calls = hashOrIdsArr.map(id => registry.interface.encodeFunctionData(
//     'tokenIdToTxHash',
//     [id],
//   )).map(callData => ({
//     target: registry.address,
//     callData,
//   }));

//   const callRes = await multiCall.callStatic.aggregate(calls);

//   const hashEntries = hashOrIdsArr.map((hid: string, i: number) => {
//     const hash = BigNumber.from(callRes[1][i]);
//     if (hash.eq(ZERO)) {
//       return [hid, hid];
//     }
//     return [hid, padHexString(hash.toHexString())]
//   });

//   if (hashEntries.length == 0) {
//     res.status(200).json({
//       statusCode: 200,
//       hashs: undefined,
//     });
//     return;
//   }

//   res.setHeader(
//     'Cache-Control',
//     `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
//   );

//   res.status(200).json({
//     statusCode: 200,
//     hashs: fromPairs(hashEntries),
//   });
// };

export default handleHash;
