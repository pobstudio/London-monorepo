import seedrandom from 'seedrandom';
import { randomRangeFactory } from './utils/random';
import * as colors from './data/colors.json';
import { makeNoise2D } from 'fast-simplex-noise';
import { Bound, Cord, Line, Range, Rect, Vec2 } from '.';
import { clamp } from 'lodash';
import { darken } from 'polished';
import { isCordInRect, scaleCord } from './utils/geometry';
import { randomVectorFieldBySeed } from './utils/field';
import {
  addVec2,
  dotMulVec2,
  lenVec2,
  lerp,
  mulVec2,
  normVec2,
  subVec2,
} from './utils/math';
import {
  getDirectionIndexFromVector,
  getDirectionVectorFromAngle,
} from './utils/directionVector';
const DIMENSION = 600;

/**
 * TODO
 * Different line primitives
 * Color effects on overlap
 * complex noise function
 * animation
 * noise over random hit
 */

export interface EmberGene {
  gridSize: Bound;
  seed: string;
  pointilism: number;
  pallete: [string, string, string, string];
}

interface Layer {
  lines: Line[];
}

interface LayerStyles {
  color: string;
}

const DEFAULT_GENE: EmberGene = {
  gridSize: [100, 100],
  seed: '11',
  pallete: ['#f4f4f4', '#6decb9', '#11999e', '#3c3c3c'],
  pointilism: 0.0125,
};

export const renderEmbers = (gene: EmberGene = DEFAULT_GENE) => {
  const randSrc = seedrandom(gene.seed);
  const { randomInArray, randomByWeights, random } = randomRangeFactory(
    randSrc,
  );
  const simplex = makeNoise2D(randSrc);
  const gridBounds: Rect = [[0, 0], gene.gridSize];
  const margin = 30;
  const bounds: Rect = [
    [margin, margin],
    [DIMENSION - margin, DIMENSION - margin],
  ];

  const generateWaveLayer = (seed: string, hitChance: number = 1): Layer => {
    const simplexShift = [lerp(0, 1000, randSrc()), lerp(0, 1000, randSrc())];
    const vectorField = randomVectorFieldBySeed(seed);
    const lines: Line[] = [];
    const hitMap: { [key: string]: boolean } = {};
    const amplitudeRange: Range = [0, 8];

    for (let i = gridBounds[0][0]; i <= gridBounds[1][0]; ++i) {
      for (let j = gridBounds[0][1]; j <= gridBounds[1][1]; ++j) {
        const c = clamp(
          simplex(
            gene.pointilism * i + simplexShift[0],
            gene.pointilism * j + simplexShift[1],
          ) / 0.5,
          0,
          1,
        );
        const amp = Math.round(lerp(...amplitudeRange, c));
        // console.log(c, amp)
        const l1: Cord = [i, j];
        const v = vectorField(mulVec2(l1, [gene.pointilism, gene.pointilism]));
        const len = lenVec2(v);
        const relativeVector: Vec2 = [0, -1];
        const angle = Math.round(
          (Math.acos(dotMulVec2(v, relativeVector) / len) / (Math.PI * 2)) *
            360,
        );
        const discreteAngle = Math.floor(angle / 45) * 45;
        const directionVector = getDirectionVectorFromAngle(discreteAngle);
        let l2: Cord = [0, 0];
        let isInBounds = false;
        let localAmp = amp;
        while (!isInBounds) {
          l2 = [
            l1[0] + directionVector[0] * localAmp,
            l1[1] + directionVector[1] * localAmp,
          ];
          if (isCordInRect(l2, gridBounds)) {
            isInBounds = true;
          } else {
            localAmp--;
          }
        }
        let isLineOverlapping = false;
        for (let i = 0; i < localAmp; ++i) {
          if (
            hitMap[
              [
                [
                  l1[0] + directionVector[0] * i,
                  l1[1] + directionVector[1] * i,
                ],
              ].join('-')
            ]
          ) {
            isLineOverlapping = true;
            break;
          }
        }

        if (randSrc() < hitChance && !isLineOverlapping) {
          lines.push([l1, l2]);
          for (let i = 0; i < localAmp; ++i) {
            hitMap[
              [
                [
                  l1[0] + directionVector[0] * i,
                  l1[1] + directionVector[1] * i,
                ],
              ].join('-')
            ] = true;
          }
        }
      }
    }

    return {
      lines,
    };
  };

  const convertLayerToPath = (layer: Layer, styles: LayerStyles) => {
    const d = layer.lines
      .map((l) => [
        scaleCord(l[0], gridBounds, bounds),
        scaleCord(l[1], gridBounds, bounds),
      ])
      .map((l) => {
        const v = subVec2(l[1], l[0]);
        // console.log(v)
        if (v[0] !== 0 && Math.abs(v[0]) === Math.abs(v[1])) {
          const radius = (v[0] !== 0 ? v[0] : v[1]) / 2;
          const uv1: Vec2 = v[1] > 0 ? [1, 0] : [0, -1];
          const uv2: Vec2 = v[1] > 0 ? [0, -1] : [-1, 0];
          const a1 = addVec2(l[0], mulVec2(uv1, [radius, radius]));
          const a2 = addVec2(l[1], mulVec2(uv2, [radius, radius]));
          // return `M ${l[0][0]} ${l[0][1]} C ${a1[0]} ${a1[1]} ${a2[0]} ${a2[1]} ${l[1][0]} ${l[1][1]}`
        }
        return `M ${l[0][0]} ${l[0][1]} L ${l[1][0]} ${l[1][1]}`;
      })
      .join(' ');
    return `<path d="${d}" stroke-width="3" stroke="${styles.color}" stroke-linecap="round" fill="transparent" />`;
  };

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${DIMENSION}" height="${DIMENSION}" viewBox="0 0 ${DIMENSION} ${DIMENSION}">` +
    `
    <style>
      path { mix-blend-mode: normal; }
    </style>` +
    `<rect opacity="0.5" fill="${gene.pallete[2]}" x="0" y="0" width="100%" height="100%"/>` +
    convertLayerToPath(generateWaveLayer(gene.seed + '0', 0.5), {
      color: gene.pallete[0],
    }) +
    convertLayerToPath(generateWaveLayer(gene.seed + '1', 0.25), {
      color: gene.pallete[1],
    }) +
    convertLayerToPath(generateWaveLayer(gene.seed + '3', 0.15), {
      color: gene.pallete[2],
    }) +
    '</svg>'
  );
};
