require('dotenv').config();

import { writeFile, readFile } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { NFTStorage, File, Blob } from 'nft.storage';
import { TokenMetadata } from './types';
import { sketchFactory } from './sketch-factory';

const ASSETS_DIR = path.resolve(__dirname, '..', 'out', 'sample');

(async () => {
  const tokenMetadata: TokenMetadata = {
    seed: 22,
    tileSet: 'aftermath',
    framed: 'nay',
    composition: 'repeat',
    rarity: 'common',
    complexity: 'normal',
  };
  sketchFactory(tokenMetadata, path.resolve(ASSETS_DIR, 'test.png'));
})();
