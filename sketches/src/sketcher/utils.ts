import seedrandom from 'seedrandom';
import { randomRangeFactory } from '../utils/random';
import * as colors from '../data/colors.json';

const getRandomPalette = (seed: string) => {
  const randFunc = seedrandom(seed);
  const { randomInArray } = randomRangeFactory(randFunc);
  const palette = randomInArray((colors as any).default);
  return palette;
}

const PALETTE_DISTRIBUTION_INCREMENTS = [0.125, 0.25, 0.5, 1];

const getPaletteDistribution = (seed: string) => {
  const [color1, color2, color3, color4] = getRandomPalette(seed);
  return {
    [color1]: PALETTE_DISTRIBUTION_INCREMENTS[3],
    [color2]: PALETTE_DISTRIBUTION_INCREMENTS[2],
    [color3]: PALETTE_DISTRIBUTION_INCREMENTS[1],
    [color4]: PALETTE_DISTRIBUTION_INCREMENTS[0],
  }
}

const getRandomPaletteDistribution = (seed: string) => {
  const [color1, color2, color3, color4] = getRandomPalette(seed);
  const randFunc = seedrandom(seed);
  const { randomInArray } = randomRangeFactory(randFunc);
  return {
    [color1]: randomInArray(PALETTE_DISTRIBUTION_INCREMENTS),
    [color2]: randomInArray(PALETTE_DISTRIBUTION_INCREMENTS),
    [color3]: randomInArray(PALETTE_DISTRIBUTION_INCREMENTS),
    [color4]: randomInArray(PALETTE_DISTRIBUTION_INCREMENTS),
  }
}

