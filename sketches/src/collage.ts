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
import seedrandom from 'seedrandom';
import { randomRangeFactory } from './utils/random';
import fetch from 'isomorphic-fetch';
import { createCanvas, loadImage } from 'canvas';
import { createWriteStream } from 'fs';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY;
const NEW_METADATA_DIR = path.resolve(
  __dirname,
  '..',
  'out',
  'new-token-metadata',
);
const COLLAGE_DIR = path.resolve(__dirname, '..', 'out', 'collage');
const METADATA_DIR = path.resolve(__dirname, '..', 'out', 'token-metadata');
const BASE_METADATA_DIR = path.resolve(__dirname, '..', 'out', 'metadata');
const IMAGE_DIR = path.resolve(__dirname, '..', 'out', 'image');
const PROVENANCE_FILE = path.resolve(__dirname, '.', 'provenance.json');

const ARTWORK_SIZE = 100;
const NUM_COL = 101;

(async () => {
  console.log('Building images');
  console.log();

  const canvas = createCanvas(
    (SUPPLY / NUM_COL) * ARTWORK_SIZE,
    NUM_COL * ARTWORK_SIZE,
  );
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < SUPPLY; ++i) {
    const image = await loadImage(path.resolve(IMAGE_DIR, `${i}.png`));
    ctx.drawImage(
      image,
      Math.floor(i / NUM_COL) * ARTWORK_SIZE,
      Math.floor(i % NUM_COL) * ARTWORK_SIZE,
      ARTWORK_SIZE,
      ARTWORK_SIZE,
    );
    console.log(`drawing image ${i}`);
  }
  const out = createWriteStream(path.resolve(COLLAGE_DIR, 'collage.png'));
  const stream = canvas.createPNGStream();
  stream.pipe(out);
})();
