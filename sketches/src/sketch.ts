import canvasSketch from 'canvas-sketch';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';

import seedrandom from 'seedrandom';
import { randomRangeFactory } from './utils/random';
import * as colors from './data/colors.json';
import {
  TilePolygons,
  TileSideSocket,
  Tile,
  Node,
  Bound,
  Cord,
  Line,
  Polygon,
  TileDrawFunc,
  Rect,
  SketchContext,
  TokenMetadata,
} from './types';
import {
  getPolygonAsLines,
  getRectBounds,
  getRectCorners,
  scaleCord,
} from './utils/geometry';
import { clamp, flatten, uniqBy } from 'lodash';
import { addVec2, getPermutations, mulVec2, subVec2 } from './utils/math';
import { newArray } from './utils/array';
import { makeNoise2D } from 'fast-simplex-noise';
import {
  EDGE_CORD_VECTORS,
  EDGE_CORD_OPPOSITE_INDEX,
  DEFAULT_DRAW_SETTINGS,
  MEMORY,
  COMPLEXITY,
} from './constants';
import { getTileDrawFunc, getTiles, getNodes } from './utils/tiles';
import { TILES } from './data/tiles';

export const sketchFactory = async (
  tokenMetadata: TokenMetadata,
  outFile: string,
  settings = DEFAULT_DRAW_SETTINGS,
) => {
  const canvasSketchSettings = settings.canvasSketchSettings;

  const sketch = () => {
    // basic setup
    const seed = tokenMetadata.seed.toString();
    const randSrc = seedrandom(seed);
    const { randomInArray, randomByWeights } = randomRangeFactory(randSrc);
    const simplex = makeNoise2D(randSrc);
    const pointilism = 0.05; // setting as such
    const memoryNum = MEMORY[tokenMetadata.composition];
    const waveBounds: Bound = COMPLEXITY[tokenMetadata.complexity];

    // visual setup
    const pallete = randomInArray((colors as any).default);
    const palleteDistribution: { [key: string]: number } = {
      [pallete[0]]: 1,
      [pallete[1]]: 0.5,
      [pallete[2]]: 0.25,
      [pallete[3]]: 0.125,
    };

    const tileSet = TILES[tokenMetadata.tileSet];

    const tiles: Tile[] = getTiles(tileSet, pallete);

    const margin = tokenMetadata.framed === 'yay' ? settings.marginInUnit : 0;

    const nodes: Node[] = getNodes(tiles);

    const getNodeIndexesBySingleRegion = () => {
      const regionMap: { [key: string]: number[] } = {};
      for (let i = 0; i < tiles.length; ++i) {
        const regionsInTile = tiles[i].polygonRegions;
        if (regionsInTile.length > 1) continue;
        for (const region of regionsInTile) {
          if (!regionMap[region]) {
            regionMap[region] = [];
          }
          regionMap[region].push(i);
        }
      }
      return regionMap;
    };

    const getRegionByCord = (cord: Cord) => {
      const preferredRegionIndex = Math.floor(
        pallete.length *
          clamp(
            Math.abs(simplex(...mulVec2(cord, [pointilism, pointilism])) / 0.8),
            0,
            0.99,
          ),
      );
      return pallete[preferredRegionIndex];
    };

    const tileDrawFunc: TileDrawFunc[] = getTileDrawFunc(tiles);

    const getWfc = (wfcSeed: number, nodes: Node[]) => {
      const seed = `${tokenMetadata.seed}.${wfcSeed}`;
      const randSrc = seedrandom(seed);
      const { randomInArray, randomByWeights } = randomRangeFactory(randSrc);

      const wave: boolean[][][] = newArray(waveBounds[0]).map((_) =>
        newArray(waveBounds[1]).map((_) => newArray(nodes.length, true)),
      );
      const nodeIndexesBySingleRegion = getNodeIndexesBySingleRegion();

      const numCompatNodeIndexes = newArray(waveBounds[0]).map((_, x) =>
        newArray(waveBounds[1]).map((_, y) =>
          newArray(nodes.length).map((_, i) =>
            newArray(EDGE_CORD_VECTORS.length).map(
              (_, v) => nodes[i].adjacencyMatrix[v].length,
            ),
          ),
        ),
      );

      const stack: [Cord, number][] = [];

      const memory: number[] = [];

      const getMinNonZeroEntropyCord = (): Cord | undefined => {
        let entropyCountToCordMap: { [entropyCount: number]: Cord[] } = {};

        for (let i = 0; i < waveBounds[0]; ++i) {
          for (let j = 0; j < waveBounds[1]; ++j) {
            const entropyCount = wave[i][j].reduce(
              (a, c) => (c ? a + 1 : a),
              0,
            );
            if (!entropyCountToCordMap[entropyCount]) {
              entropyCountToCordMap[entropyCount] = [];
            }
            entropyCountToCordMap[entropyCount].push([i, j]);
          }
        }

        // if the count of cords that determined is exactly the amount in cord, it has been collapsed
        const totalDetermined =
          (entropyCountToCordMap[0]?.length ?? 0) +
          (entropyCountToCordMap[1]?.length ?? 0);
        if (totalDetermined >= waveBounds[0] * waveBounds[1]) {
          return undefined;
        }

        for (let i = 2; i <= nodes.length; ++i) {
          if (
            !!entropyCountToCordMap[i] &&
            entropyCountToCordMap[i].length !== 0
          ) {
            return randomInArray(entropyCountToCordMap[i]);
          }
        }

        return undefined;
      };

      const getPossibleNodeIndexes = (cord: Cord) =>
        wave[cord[0]]?.[cord[1]]?.reduce(
          (a, c, i) => (c ? [...a, i] : a),
          [] as number[],
        );

      const collapseCord = (cord: Cord) => {
        const nodeIndexes = getPossibleNodeIndexes(cord);
        const preferredNodeIndexes =
          nodeIndexesBySingleRegion[getRegionByCord(cord)];
        const weights = nodeIndexes.map((i) => {
          const multiplier = tiles[i].polygonRegions.reduce(
            (a, c) => (palleteDistribution[c] > a ? palleteDistribution[c] : a),
            0,
          );
          if (memory.slice(-1 * memoryNum).find((p) => p === i))
            return 81 * multiplier;
          if (preferredNodeIndexes?.find((p) => p === i))
            return 64 * multiplier;
          return 1;
        });
        const randomWeightedIndex = randomByWeights(weights);
        const nodeIndexToCollapse = nodeIndexes[randomWeightedIndex];
        memory.push(nodeIndexToCollapse);
        newArray(nodes.length).forEach((_: any, i: number) => {
          if (i !== nodeIndexToCollapse) banCord(cord, i);
        });
      };

      const banCord = (cord: Cord, n: number) => {
        if (!wave[cord[0]][cord[1]][n]) {
          return;
        }
        const compat = numCompatNodeIndexes[cord[0]][cord[1]][n];
        for (let i = 0; i < EDGE_CORD_VECTORS.length; ++i) {
          compat[i] = 0;
        }
        wave[cord[0]][cord[1]][n] = false;
        stack.push([cord, n]);
      };

      const propagateCord = () => {
        const process = () => {
          const s = stack.pop();
          if (!s) {
            return;
          }

          // cord and the nodeIndex that has been flagged false
          const [cord, nodeIndex] = s;

          if (
            cord[0] < 0 ||
            cord[0] >= waveBounds[0] ||
            cord[1] < 0 ||
            cord[1] >= waveBounds[1]
          ) {
            return;
          }

          nodes[nodeIndex].adjacencyMatrix.forEach((adj, j) => {
            const dCord = addVec2(cord, EDGE_CORD_VECTORS[j]);
            const compat = numCompatNodeIndexes?.[dCord[0]]?.[dCord[1]];
            if (!!compat) {
              adj.forEach((n) => {
                compat[n][EDGE_CORD_OPPOSITE_INDEX[j]]--;
                if (compat[n][EDGE_CORD_OPPOSITE_INDEX[j]] === 0) {
                  banCord(dCord, n);
                }
              });
            }
          });
        };

        while (stack.length !== 0) {
          process();
        }
      };

      const collapseStep = () => {
        const c = getMinNonZeroEntropyCord();
        if (!c) {
          return false;
        }
        collapseCord(c);
        propagateCord();
        return true;
      };

      const collapse = () => {
        let step = 0;

        while (collapseStep()) {
          step++;
        }
      };

      const getWave = () => wave;

      return {
        collapse,
        collapseStep,
        getWave,
      };
    };

    return ({ context: ctx }: SketchContext) => {
      const getWaveWithResults = () => {
        let seed = 0;
        while (true) {
          const { collapse, getWave } = getWfc(seed, nodes);

          collapse();

          const wave = getWave();

          // if first tile is not impossible return it
          if (wave[0][0].filter((a) => a).length !== 0) {
            return wave;
          }
          seed++;
        }
      };

      const wave = getWaveWithResults();

      const drawableRect: Rect = [
        [margin, margin],
        subVec2(canvasSketchSettings.dimensions as Bound, [margin, margin]),
      ];

      const drawableBounds: Bound = getRectBounds(drawableRect);

      ctx.fillStyle = pallete[0];
      ctx.fillRect(...[0, 0], ...canvasSketchSettings.dimensions);

      for (let i = 0; i < wave.length; ++i) {
        for (let j = 0; j < wave[i].length; ++j) {
          const nodeIndexes = wave[i][j].reduce(
            (a, c, i) => (c ? [...a, i] : a),
            [] as number[],
          );
          ctx.globalAlpha = (nodes.length - nodeIndexes.length) / nodes.length;
          const r: Rect = [
            scaleCord([i, j], [[0, 0], waveBounds], drawableRect),
            scaleCord([i + 1, j + 1], [[0, 0], waveBounds], drawableRect),
          ];
          nodeIndexes.forEach((i) => tileDrawFunc[i]?.(ctx, r));
        }
      }
    };
  };

  const canvas = createCanvas(
    canvasSketchSettings.dimensions[0],
    canvasSketchSettings.dimensions[1],
  );

  await canvasSketch(sketch, { ...canvasSketchSettings, canvas });
  const out = createWriteStream(outFile);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  await new Promise((res) => {
    out.on('finish', res);
  });
};
