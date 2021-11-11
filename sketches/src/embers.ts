import seedrandom from 'seedrandom';
import { randomRangeFactory } from './utils/random';
import * as colors from './data/colors.json';
import { makeNoise2D } from 'fast-simplex-noise';
import { Bound, Cord, Line, Range, Rect, Vec2 } from '.';
import { clamp } from 'lodash';
import { darken } from 'polished'
import { scaleCord } from './utils/geometry';
import { randomVectorFieldBySeed } from './utils/field';
import { dotMulVec2, lenVec2, lerp, mulVec2, subVec2 } from './utils/math';
import { getDirectionVectorFromAngle } from './utils/directionVector';
const DIMENSION = 600;

export interface EmberGene {
  gridSize: Bound,
  seed: string,
  pointilism: number,
  pallete: [string, string, string, string],
}

interface Layer {
  lines: Line[];
}

interface LayerStyles {
  color: string;
}

const DEFAULT_GENE: EmberGene = {
  gridSize: [50, 50],
  seed: '7',
  pallete:    ["#f8bd7f", "#00416d", "#f5f1da", "#e3dfc8"],
  pointilism: 0.01,
}

export const renderEmbers = (gene: EmberGene = DEFAULT_GENE) => {         
  const randSrc = seedrandom(gene.seed);
  const { randomInArray, randomByWeights, random } = randomRangeFactory(randSrc);
  const simplex = makeNoise2D(randSrc);
  const gridBounds: Rect = [[0, 0], gene.gridSize];
  const margin = 20;
  const bounds: Rect = [[margin, margin], [DIMENSION - margin, DIMENSION - margin]];

  const generateGridLayer = (): Layer => {
    const lines: Line[] = [];
    let isEnding = false;
    let x = 0;
    let y = 0;
    while (!isEnding) {
      const length = random(1, 8, 'int');
      const newX = clamp(x + length, 0, gene.gridSize[0]);
      lines.push([[x, y], [newX, y]]);
      x = newX + 1;
      if (x > gene.gridSize[0]) {
        if (y >= gene.gridSize[1]) {
          isEnding = true;
        }
        x = 0;
        y++;
      }
    }
    return {
      lines,
    }
  }

  const generateWaveLayer = (seed: string, hitChance: number = 1): Layer => {
    const simplexShift = [lerp(0, 1000, randSrc()), lerp(0, 1000, randSrc())];
    const vectorField = randomVectorFieldBySeed(seed);
    const lines: Line[] = [];
    const hitMap:  { [key: string]: boolean } = {};
    const amplitudeRange: Range = [0, 4];

    for (let i = gridBounds[0][0]; i <= gridBounds[1][0]; ++i) {
      for (let j = gridBounds[0][1]; j <= gridBounds[1][1]; ++j) {
        const c = clamp(simplex(gene.pointilism * i + simplexShift[0], gene.pointilism * j + simplexShift[1]) / 0.6, 0, 1);
        const amp = Math.round(lerp(...amplitudeRange, c));
        console.log(c, amp)
        const l1: Cord = [i, j];
        const v = vectorField(
          mulVec2(l1, [
            gene.pointilism,
            gene.pointilism,
          ]),
        );
        const len = lenVec2(v);
        const relativeVector: Vec2 = [0, -1];
        const angle = Math.round(
          (Math.acos(dotMulVec2(v, relativeVector) / len) / (Math.PI * 2)) *
            360,
        );
        const discreteAngle = Math.floor(angle / 45) * 45;
        const directionVector = getDirectionVectorFromAngle(discreteAngle);
        const l2: Cord = [
          l1[0] + directionVector[0] * amp,
          l1[1] + directionVector[1] * amp
        ];

        if(randSrc() < hitChance && !hitMap[l1.join('-')] && !hitMap[l2.join('-')]) {
          lines.push([l1, l2]);
          hitMap[l1.join('-')] = true;
          hitMap[l2.join('-')] = true; 
        }

      }
    }

    return {
      lines
    }
  }


  const clampLine = (line: Line): Line => {
    const v = subVec2(line[1], line[0]);
    const m = v[1] / v[0];
    const clampCord = (cord: Cord) => {
      if (cord[0] < gridBounds[0][0]) {
        return [
          (gridBounds[0][1] - cord[1]) / m + cord[0],
          cord[1]
        ] as Cord
      }
      if (cord[0] > gridBounds[1][0]) {
        return [
          (gridBounds[1][1] - cord[1]) / m + cord[0],
          cord[1]
        ] as Cord
      }
      if (cord[1] < gridBounds[0][1]) {
        return [
          cord[0],
          m * (gridBounds[0][0] - cord[0]) + cord[1]
        ] as Cord
      }
      if (cord[1] < gridBounds[1][1]) {
        return [
          cord[0],
          m * (gridBounds[1][0] - cord[0]) + cord[1]
        ] as Cord
      }
      return cord;
    }
    return [clampCord(line[0]), clampCord(line[1])];
  }

  const convertLayerToPath = (layer: Layer, styles: LayerStyles) => {
    const d = layer.lines.map(l => [scaleCord(l[0], gridBounds, bounds), scaleCord(l[1], gridBounds, bounds)]).map(l => `M ${l[0][0]} ${l[0][1]} L ${l[1][0]} ${l[1][1]}`).join(' ');
    return `<path d="${d}" stroke-width="4" stroke="${styles.color}" stroke-linecap="round" />`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${DIMENSION}" height="${DIMENSION}" viewBox="0 0 ${DIMENSION} ${DIMENSION}">`
  + `<rect opacity="0.5" fill="${gene.pallete[2]}" x="0" y="0" width="100%" height="100%"/>`
  + convertLayerToPath(generateGridLayer(), { color: darken(0.001)(gene.pallete[2])})
  + convertLayerToPath(generateWaveLayer(gene.seed + '0', 0.25), { color: gene.pallete[0]} )
  + convertLayerToPath(generateWaveLayer(gene.seed + '1', 0.1), { color: gene.pallete[1]} )
  + convertLayerToPath(generateWaveLayer(gene.seed + '3', 0.05), { color: gene.pallete[3]} )
  + '</svg>'
}