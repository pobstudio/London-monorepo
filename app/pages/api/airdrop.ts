import { deployments } from '@pob/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import { NULL_SIGNATURE, OPENSEA_API_KEY } from '../../constants';
import { ADDRESS_REGEX } from '../../utils/regex';
import { AIRDROP_DATA } from '../../data/airdrop';
import { find } from 'lodash';
import { BURN_NOBLE_AIRDROP_AMOUNT_REVERSE_LOOKUP } from '../../constants/parameters';
import { Wallet } from '@ethersproject/wallet';
import { PROVIDER } from '../../constants/providers';
import { utils } from 'ethers';

const EMBERS_MINTING_AUTHORITY_PRIVATE_KEY =
  process.env.EMBERS_MINTING_AUTHORITY_PRIVATE_KEY || '';
const mintingSigner = new Wallet(
  EMBERS_MINTING_AUTHORITY_PRIVATE_KEY,
  PROVIDER,
);

const airdropRows = AIRDROP_DATA.split('\n').map((r) =>
  r.split(',').map((s) => s.trim()),
);

const handleAirdropRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { to } = req.query;

  if (typeof to != 'string' || !ADDRESS_REGEX.test(to)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid address' });
    return;
  }

  const normAddress = to.toLowerCase();
  const row = find(airdropRows, (r) => r[0] === normAddress);
  if (!row) {
    res.status(200).json({
      statusCode: 200,
      to,
      nobility: 0,
      signature: NULL_SIGNATURE,
    });
    return;
  }
  const numAirdropped = parseInt(row[4]);
  const nobility = BURN_NOBLE_AIRDROP_AMOUNT_REVERSE_LOOKUP[numAirdropped];
  console.log(numAirdropped, nobility);
  const messageHash = utils.solidityKeccak256(
    ['address', 'uint8'],
    [to, nobility],
  );
  console.log(messageHash);
  const bytesMessageHash = utils.arrayify(messageHash);
  const signature = await mintingSigner.signMessage(bytesMessageHash);
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=65536, max-age=65536`,
  );
  res.status(200).json({
    statusCode: 200,
    to,
    nobility,
    signature,
  });
};

export default handleAirdropRequest;
