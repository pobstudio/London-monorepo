require('dotenv').config();

import { writeFile, readFile, createReadStream } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { STARTING_INDEX, SUPPLY } from './constants';
import {
  generateNameFromSeed,
  generateTokenMetadata,
  mapTokenMetadataToAttributes,
} from './generate';
import { sketchFactory } from './sketch';
import { createHash } from 'crypto';
import { NFTStorage, File } from 'nft.storage';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY;
const METADATA_DIR = path.resolve(__dirname, '..', 'out', 'token-metadata');
const BASE_METADATA_DIR = path.resolve(__dirname, '..', 'out', 'metadata');
const IMAGE_DIR = path.resolve(__dirname, '..', 'out', 'image');
const PROVENANCE_FILE = path.resolve(__dirname, '..', 'provenance.json');

const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });

(async () => {
  console.log('Building images');
  console.log();

  // const generate = generateTokenMetadata(STARTING_INDEX);

  // const stats: any = {};
  // for (let i = 1559 * 3; i < SUPPLY; ++i) {
  //   const metadata = generate(i + STARTING_INDEX);
  //   if (!stats[metadata.rarity]) {
  //     stats[metadata.rarity] = 0;
  //   }
  //   stats[metadata.rarity]++;
  //   console.log(`building token ${i}`)
  //   await writeFileAsync(
  //     path.resolve(BASE_METADATA_DIR, `${i}.json`),
  //     JSON.stringify(metadata),
  //   );
  //   await sketchFactory(metadata, path.resolve(IMAGE_DIR, `${i}.png`))
  // }
  // console.log();
  // console.log('Build complete, stats:');
  // Object.entries(stats).forEach((s: [string, any]) => {
  //   console.log(`${s[0]}: ${(s[1] / SUPPLY).toString().slice(0, 6)}%`);
  // });

  console.log('Building provenance');
  let imageConcatStr = '';

  for (let i = 0; i < SUPPLY; ++i) {
    const imageHash = await new Promise((res) => {
      let hash = createHash('sha256');
      const s = createReadStream(path.resolve(IMAGE_DIR, `${i}.png`));
      // s.on("error", err => reject(err));
      s.on('data', (chunk) => hash.update(chunk));
      s.on('end', () => res(hash.digest('hex')));
    });
    imageConcatStr += imageHash;
  }
  const provenance = createHash('sha256').update(imageConcatStr).digest('hex');
  const provenanceMetadata = {
    provenance,
    imageConcatStr,
    startingIndex: STARTING_INDEX,
  };
  console.log('Provenance created.');
  console.log();
  console.log('Uploading to IPFS');

  await writeFileAsync(
    PROVENANCE_FILE,
    JSON.stringify({ ...provenanceMetadata }),
  );
  const files: File[] = [];

  const getName = generateNameFromSeed(STARTING_INDEX);

  // for (let i = 9737; i < SUPPLY; ++i) {
  //   const metadataBlob = await readFileAsync(
  //     path.resolve(BASE_METADATA_DIR, `${i}.json`),
  //   );
  //   const traits = JSON.parse(metadataBlob.toString());
  //   const blob = await readFileAsync(path.resolve(IMAGE_DIR, `${i}.png`));
  //   const imageCid = await client.storeBlob(
  //     new File([blob], `${i}.png`, { type: 'image/png' }),
  //   );
  //   // const tokenMetadataBlob = await readFileAsync(
  //   //   path.resolve(METADATA_DIR, `${i}`),
  //   // );
  //   // const oldtoken = JSON.parse(tokenMetadataBlob.toString());
  //   const name = getName();
  //   const token = {
  //     name,
  //     description: `In celebration of EIP-1559.`,
  //     image: `ipfs://${imageCid}`,
  //     attributes: [
  //       ...mapTokenMetadataToAttributes(traits),
  //       { trait_type: 'name length', value: name.split(' ').length },
  //     ],
  //   };
  //   files.push(
  //     new File([JSON.stringify(token)], `${i}`, { type: 'application/json' }),
  //   );
  //   await writeFileAsync(
  //     path.resolve(METADATA_DIR, `${i}`),
  //     JSON.stringify(token),
  //   );
  //   console.log(`written token metadata for ${i}`);
  // }
  console.log();
  // const rootCid = await client.storeDirectory(files);
  // console.log(`root cid`, rootCid);
  console.log('complete.');
})();
