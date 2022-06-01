require('dotenv').config();

import { writeFile, readFile } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { NFTStorage, File, Blob } from 'nft.storage';
import { TokenMetadata } from './types';
import { sketchFactory } from './sketch-factory';

const ASSETS_DIR = path.resolve(__dirname, '..', 'out', 'sample');

(async () => {
  for (let i = 0; i < 10; ++i) {
    const tokenMetadata: TokenMetadata = {
      seed: 33 + i,
      tileSet: 'glitches',
      framed: 'nay',
      composition: 'repeat',
      rarity: 'common',
      complexity: 'normal',
    };
    sketchFactory(tokenMetadata, path.resolve(ASSETS_DIR, i + '.png'));
  }
})();
