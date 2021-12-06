import { deployments, ERC721__factory } from '@pob/protocol';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CHAIN_ID,
  NFT_STORAGE_API_KEY,
  OPENSEA_API_KEY,
} from '../../constants';
import { ADDRESS_REGEX } from '../../utils/regex';
import { NFTStorage, Blob } from 'nft.storage';
import { Wallet } from '@ethersproject/wallet';
import { PROVIDER } from '../../constants/providers';
import {
  getEmberGene,
  getEmbersTokenMetadataFromGene,
  computeEmbers,
} from '@pob/sketches';
import { renderEmbersAsGif } from '@pob/sketches/src/render-embers-gif';
import { utils } from 'ethers';
import { TOKEN_TYPES, TOKEN_TYPES_TO_LABEL } from '../../constants/parameters';
import { MintCheck } from '../../types';
import { createWriteStream, readFile } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { getIPFSUrl } from '../../utils/urls';

const embers = ERC721__factory.connect(deployments[CHAIN_ID].embers, PROVIDER);

const handleGif = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenId } = req.query;

  if (typeof tokenId !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'seed is not a valid value' });
    return;
  }

  const uri = await embers.tokenURI(tokenId);

  if (!uri.startsWith('ipfs://')) {
    res.status(422).json({ statusCode: 422, message: 'invalid token' });
    return;
  }
  const url = getIPFSUrl(uri.slice(7));
  const fetchRes = await fetch(url);
  const metadata = await fetchRes.json();
  if (!metadata.gene) {
    res.status(422).json({ statusCode: 422, message: 'invalid token metdata' });
    return;
  }

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=65536, max-age=65536`,
  );
  await renderEmbersAsGif(metadata.gene, res);
  res.end();
};

export default handleGif;
