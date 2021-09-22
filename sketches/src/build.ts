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
import { sketchFactory } from './sketch-factory';
import { createHash } from 'crypto';
import { NFTStorage, File } from 'nft.storage';
import seedrandom from 'seedrandom';
import { randomRangeFactory } from './utils/random';
import fetch from 'isomorphic-fetch';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY;
const NEW_METADATA_DIR = path.resolve(
  __dirname,
  '..',
  'out',
  'new-token-metadata',
);
const METADATA_DIR = path.resolve(__dirname, '..', 'out', 'token-metadata');
const BASE_METADATA_DIR = path.resolve(__dirname, '..', 'out', 'metadata');
const IMAGE_DIR = path.resolve(__dirname, '..', 'out', 'image');
const PROVENANCE_FILE = path.resolve(__dirname, '.', 'provenance.json');

const client = new NFTStorage({ token: NFT_STORAGE_API_KEY ?? '' });

const CUSTOM_NAMES = [
  'ode to vitalik',
  'f**k me',
  "shhh, i'm calling the ETH manager",
  'donate to 0x68A99f89E475a078645f4BAC491360aFe255Dff1',
  'EIP 1559',
  'press F to pay respect',
  'no wash trading',
  '$LONDON is more than just this',
  'avatar pfp 10k NFT (does this help SEO?)',
  'pump and pump and pump',
  'buy a hardware wallet',
  'this is just an IPFS file',
  'can you shill this for me?',
  'last sold for 100 ETH',
  'prrfbeauty',
  'in honor of the failed txns',
  'NEW AVATAR PROJECT. JOIN THE DISCORD',
  'shill me your NFTs',
  'giving away _____ follow RT like',
  'our inspiration: pak XCOPY artblocks',
  'git checkout -b feat/new-avatar-project',
  '$HASH is history',
  'people will talk about this',
  'for the artists',
  'thank @ape6056 for me',
  'power overwhelming',
  'ctrl-c',
  'ctrl-v',
  "don't you dare sell me",
  "don't you dare buy me",
];

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

  // console.log('Building provenance');
  let imageConcatStr = '';
  const imageHashes: string[] = [];
  for (let i = 0; i < SUPPLY; ++i) {
    const imageHash = await new Promise((res) => {
      let hash = createHash('sha256');
      const s = createReadStream(path.resolve(IMAGE_DIR, `${i}.png`));
      // s.on("error", err => reject(err));
      s.on('data', (chunk) => hash.update(chunk));
      s.on('end', () => res(hash.digest('hex')));
    });
    imageConcatStr += imageHash;
    imageHashes.push(imageHash as string);
  }
  const provenance = createHash('sha256').update(imageConcatStr).digest('hex');
  console.log('Provenance created.');
  console.log();
  console.log('Uploading to IPFS');

  // const files: File[] = [];

  // for (let i = 0; i < 8888; ++i) {
  //   const tokenRes = await fetch(`https://dweb.link/ipfs/bafybeianvcjm7iaimmdarbm4dvkq7trbhyz6qecyfyvtlz23xixunda4ly/${i}`)
  //   await writeFileAsync(
  //     path.resolve(METADATA_DIR, `${i}`),
  //     JSON.stringify(await tokenRes.json()),
  //   );
  //   console.log(`written token metadata for ${i}`);
  // }

  // const randSrc = seedrandom(STARTING_INDEX.toString());
  // const seedRandomFactory = randomRangeFactory(randSrc);

  // const getName = generateNameFromSeed(STARTING_INDEX);

  // const customNameIndexes: number[] = [];
  // while (customNameIndexes.length < CUSTOM_NAMES.length) {
  //   const randomIndex = seedRandomFactory.random(0, SUPPLY, 'int');
  //   if (!customNameIndexes.includes(randomIndex)) {
  //     customNameIndexes.push(randomIndex);
  //   }
  // }

  const provenanceAndImage: [string, string][] = [];

  for (let i = 0; i < SUPPLY; ++i) {
    // const metadataBlob = await readFileAsync(
    //   path.resolve(BASE_METADATA_DIR, `${i}.json`),
    // );
    // const traits = JSON.parse(metadataBlob.toString());
    // const blob = await readFileAsync(path.resolve(IMAGE_DIR, `${i}.png`));
    // const imageCid = await client.storeBlob(
    //   new File([blob], `${i}.png`, { type: 'image/png' }),
    // );
    const tokenMetadataBlob = await readFileAsync(
      path.resolve(METADATA_DIR, `${i}`),
    );
    const newId = i < 3655 ? i + 8888 : i;
    const oldtoken = JSON.parse(tokenMetadataBlob.toString());
    // const randomName = getName();
    // const customName = customNameIndexes.includes(i)
    //   ? CUSTOM_NAMES[customNameIndexes.findIndex((a) => a === i)]
    //   : undefined;
    // if (!!customName) {
    //   customNameAtIndex.push([customName, i]);
    // }

    // const token = {
    //   name: customName ?? randomName,
    //   description: `In celebration of EIP-1559.`,
    //   image: oldtoken.image,
    //   attributes: [
    //     ...mapTokenMetadataToAttributes(traits),
    //     {
    //       trait_type: 'name',
    //       value: !!customName
    //         ? 'unique'
    //         : randomName.split(' ').length.toString(),
    //     },
    //   ],
    // };
    // await writeFileAsync(
    //   path.resolve(METADATA_DIR, `${i}`),
    //   JSON.stringify(token),
    // );
    provenanceAndImage.push([imageHashes[i], oldtoken.image]);
    console.log(`written token metadata for ${i}`);
  }
  console.log();
  console.log(CUSTOM_NAMES.length);

  // const rootCid = await client.storeDirectory(files);
  // console.log(`root cid`, rootCid);
  const provenanceMetadata = {
    provenance,
    imageConcatStr,
    provenanceAndImage,
  };
  await writeFileAsync(
    PROVENANCE_FILE,
    JSON.stringify({ ...provenanceMetadata }),
  );
  console.log('complete.');
})();
