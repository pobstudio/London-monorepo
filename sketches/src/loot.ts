import seedrandom from 'seedrandom';
import {
  Complexity,
  Composition,
  COMPLEXITY,
  MEMORY,
  Rarity,
  RARITY,
} from './constants';
import { TokenMetadata } from './types';
import { randomRangeFactory } from './utils/random';
import { TileSet } from './data/tiles';
import generateName from 'project-name-generator';

export const NAMES_RARITY_MAP: { [key: number]: number } = {
  2: 0.5,
  3: 0.43,
  4: 0.04,
  5: 0.02,
  1: 0.01,
};

export const generateNameFromSeed = (seed: number) => {
  const randSrc = seedrandom(seed.toString());
  const seedRandomFactory = randomRangeFactory(randSrc);

  const rarityEntries = Object.entries(NAMES_RARITY_MAP);
  const rarityKeys = rarityEntries.map((r) => r[0]);
  const rarityWeights = rarityEntries.map((r) => r[1]);

  return () => {
    const numWords = seedRandomFactory.randomInArrayByWeights(
      rarityKeys,
      rarityWeights,
    );
    return generateName({ words: numWords }).spaced;
  };
};

export const RARITY_TILE_MAP: { [key: string]: TileSet[] } = {
  common: ['grid', 'quilt', 'frizzle', 'squiggle', 'squiggle_1', 'squiggle_2'],
  rare: ['diagonal', 'ripped', 'shattered', 'stairs'],
  superRare: ['cities', 'squiggle'],
  secretRare: ['pipes'],
};

export const COMPLEXITY_WEIGHTS = {
  unique: 0.02,
  super_complex: 0.08,
  complex: 0.2,
  normal: 0.3,
  simple: 0.3,
  minimal: 0.1,
};

export const mapTokenMetadataToAttributes = (metadata: TokenMetadata) => {
  return Object.entries(metadata).map(([trait, value]) => ({
    trait_type: trait,
    value: value,
  }));
};

export const generateTokenMetadata = (source: number) => {
  const randSrc = seedrandom(source.toString());
  const randomFactory = randomRangeFactory(randSrc);

  const rarityEntries = Object.entries(RARITY);
  const rarityKeys = rarityEntries.map((r) => r[0]);
  const rarityWeights = rarityEntries.map((r) => r[1]);

  const complexityEntries = Object.entries(COMPLEXITY_WEIGHTS);
  const complexityKeys = complexityEntries.map((r) => r[0]);
  const complexityWeights = complexityEntries.map((r) => r[1]);

  return (seed: number): TokenMetadata => {
    const rarity = randomFactory.randomInArrayByWeights(
      rarityKeys,
      rarityWeights,
    );
    const randSrc = seedrandom(seed.toString());
    const seedRandomFactory = randomRangeFactory(randSrc);
    const tileSet = seedRandomFactory.randomInArray(RARITY_TILE_MAP[rarity]);
    return {
      seed,
      tileSet,
      framed: Math.abs(randSrc()) > 0.2 ? 'yay' : 'nay',
      composition: seedRandomFactory.randomInArray(
        Object.keys(MEMORY) as Composition[],
      ),
      rarity,
      complexity: seedRandomFactory.randomInArrayByWeights(
        complexityKeys,
        complexityWeights,
      ),
    };
  };
};
