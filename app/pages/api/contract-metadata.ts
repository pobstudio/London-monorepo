import { NextApiRequest, NextApiResponse } from 'next';
import { HASH_PROD_LINK } from '../../constants';

const handleContractURI = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    name: "Proof of Beauty's $HASH",
    description: 'Tokenize a moment of ETH history',
    image: `${HASH_PROD_LINK}/logo.png`,
    external_link: HASH_PROD_LINK,
  });
};

export default handleContractURI;
