import { Bound, Cord } from './types';

export const STARTING_INDEX = 1559;
export const SUPPLY = 8888;
export const DEFAULT_DIMENSIONS = [2048, 2048];
export const PRINT_DIMENSIONS = DEFAULT_DIMENSIONS.map((x) => x * 4);

export interface DRAW_SETTINGS_TYPE {
  canvasSketchSettings: {
    dimensions: number[];
  };
  marginInUnit: number;
}

export const DEFAULT_DRAW_SETTINGS = {
  canvasSketchSettings: {
    dimensions: DEFAULT_DIMENSIONS,
  },
  marginInUnit: 48,
};

export const PRINT_DRAW_SETTINGS = {
  canvasSketchSettings: {
    dimensions: PRINT_DIMENSIONS,
  },
  marginInUnit: 48,
};

export const EDGE_CORD_VECTORS: Cord[] = [
  // N
  [0, -1],
  // E
  [1, 0],
  // S
  [0, 1],
  // W
  [-1, 0],
];

export const EDGE_CORD_OPPOSITE_INDEX = [2, 3, 0, 1];

export const MEMORY = {
  random: 4,
  normal: 8,
  repeat: 20,
};

export type Composition = keyof typeof MEMORY;

export const RARITY = {
  common: 0.5,
  rare: 0.3,
  superRare: 0.15,
  secretRare: 0.05,
};

export type Rarity = keyof typeof RARITY;

export const COMPLEXITY: { [key: string]: Bound } = {
  unique: [125, 125],
  super_complex: [100, 100],
  complex: [75, 75],
  normal: [50, 50],
  simple: [25, 25],
  minimal: [15, 15],
};

export type Complexity = keyof typeof COMPLEXITY;
