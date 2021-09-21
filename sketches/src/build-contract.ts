require('dotenv').config();

import { writeFile, readFile } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { NFTStorage, File, Blob } from 'nft.storage';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY;
const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });
const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

(async () => {
  console.log('Building contract uri');
  console.log();
  const blob = await readFileAsync(path.resolve(ASSETS_DIR, `icon.png`));
  const imageCid = await client.storeBlob(
    new File([blob], `icon.png`, { type: 'image/png' }),
  );

  const contractURI = {
    name: '$LONDON Gift',
    description: 'Gifts for the bold miners of 15.59 GWEI.',
    image: `ipfs://${imageCid}`,
    external_link: 'https://london.pob.studio',
    seller_fee_basis_points: 500,
    fee_recipient: '0x5766ab511a204C34661e85af5ba498E2e715A420',
  };
  const metadataBlob = new Blob([JSON.stringify(contractURI)]);
  const rootCid = await client.storeBlob(metadataBlob);
  console.log(rootCid);
})();
