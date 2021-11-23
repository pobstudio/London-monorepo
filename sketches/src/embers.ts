import seedrandom from 'seedrandom';
import { randomRangeFactory } from './utils/random';
import * as colors from './data/colors.json';
import { makeNoise3D } from 'fast-simplex-noise';
import { Bound, Cord, Line, Range, Rect, Vec2 } from '.';
import { clamp } from 'lodash';
import { darken } from 'polished';
import { isCordInRect, scaleCord } from './utils/geometry';
import { randomVectorFieldBySeed } from './utils/field';
import {
  addVec2,
  applyVec2,
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
import { newArray } from './utils/array';
import { generateName } from './utils/name';
const DIMENSION = 600;

export interface EmberGene {
  gridSize: Bound;
  seed: string;
  strokeWidth: number;
  pointilism: number;
  pallete: [string, string, string, string];
  frameCt: number;
  framePointilism: number;
}

interface Layer {
  lines: Line[];
}

interface LayerStyles {
  color: string;
  strokeWidth: number;
  animation?: string;
}

const DEFAULT_GENE: EmberGene = {
  gridSize: [125, 125],
  seed: '0',
  pallete: ['#00bdaa', '#400082', '#fe346e', '#f1e7b6'],
  pointilism: 0.001,
  strokeWidth: 2,
  frameCt: 50,
  framePointilism: 0.01,
};

const FRAME_DURATION = 0.2;
const MARGIN = 30;
const AMPLITUDE_RANGE: Range = [0, 12];

export const GRID_SIZE_AND_WEIGHT: [Bound[], number[]] = [
  [
    [15, 15],
    [25, 25],
    [50, 50],
    [75, 75],
    [100, 100],
    [125, 125],
  ],
  [0.25, 0.25, 0.2, 0.15, 0.1, 0.05],
];

export const GRID_SIZE_TO_STROKE_WIDTH_RANGE: { [k: number]: Range } = {
  15: [1, 26],
  25: [1, 15],
  50: [1, 8],
  75: [1, 5],
  100: [1, 4],
  125: [1, 3],
};

export const GRID_SIZE_TO_LABEL: { [k: number]: string } = {
  15: 'empty',
  25: 'minimal',
  50: 'normal',
  75: 'dense',
  100: 'complex',
  125: 'super complex',
};

export const BASIC_FRAME_CT_AND_WEIGHT: [number[], number[]] = [
  [1, 5, 10, 20, 40, 50],
  [0.3, 0.2, 0.2, 0.2, 0.09, 0.01],
];

export const ADVANCED_FRAME_CT_AND_WEIGHT: [number[], number[]] = [
  [1, 5, 10, 20, 40, 50],
  [0, 0.2, 0.2, 0.4, 0.15, 0.05],
];

export const FRAME_CT_TO_LABEL: { [k: number]: string } = {
  1: 'still',
  5: 'gif',
  10: 'tik tok',
  20: 'vlog',
  40: 'short film',
  50: 'movie',
};

export const FRAME_POINTILISM_AND_WEIGHT: [number[], number[]] = [
  [0.01, 0.001, 0.1],
  [0.49, 0.49, 0.02],
];

export const FRAME_POINTILISM_TO_LABEL: { [k: number]: string } = {
  0.01: 'noisy',
  0.001: 'flowy',
  0.1: 'crazy',
};

export const getEmberGene = (seed: string, tokenType: string): EmberGene => {
  const randSrc = seedrandom(seed);
  const { random, randomInArray, randomInArrayByWeights } =
    randomRangeFactory(randSrc);
  const pallete = randomInArray((colors as any).default);
  const gridSize: Bound = randomInArrayByWeights(
    GRID_SIZE_AND_WEIGHT[0],
    GRID_SIZE_AND_WEIGHT[1],
  );

  const frameCt =
    tokenType === 'gift' || tokenType === 'ashen' || tokenType === 'ultrasonic'
      ? randomInArrayByWeights(
          ADVANCED_FRAME_CT_AND_WEIGHT[0],
          ADVANCED_FRAME_CT_AND_WEIGHT[1],
        )
      : randomInArrayByWeights(
          BASIC_FRAME_CT_AND_WEIGHT[0],
          BASIC_FRAME_CT_AND_WEIGHT[1],
        );

  const framePointilism = randomInArrayByWeights(
    FRAME_POINTILISM_AND_WEIGHT[0],
    FRAME_POINTILISM_AND_WEIGHT[1],
  );

  // calculate strokeWidth
  const strokeWidthRange = GRID_SIZE_TO_STROKE_WIDTH_RANGE[gridSize[0]];
  const strokeWidth = random(...strokeWidthRange, 'int');

  const pointilism = random(0.001, 0.1, 'float');

  return {
    gridSize,
    seed: `seed-${seed}`,
    pallete,
    strokeWidth,
    frameCt,
    framePointilism,
    pointilism,
  };
};

export const getEmbersTokenMetadataFromGene = (
  image: string,
  gene: EmberGene,
  tokenTypeLabel: string,
): any => {
  return {
    name: generateName(gene.seed),
    description: 'The embers from celebrating ETH two point oh.',
    image,
    gene,
    attributes: [
      { trait_type: 'gridSize', value: GRID_SIZE_TO_LABEL[gene.gridSize[0]] },
      {
        trait_type: 'animationDuration',
        value: FRAME_CT_TO_LABEL[gene.frameCt],
      },
      {
        trait_type: 'animationStyle',
        value: FRAME_POINTILISM_TO_LABEL[gene.framePointilism],
      },
      {
        trait_type: 'provenance',
        value: tokenTypeLabel,
      },
    ],
  };
};

export const renderEmbers = (gene: EmberGene = DEFAULT_GENE) => {
  const randSrc = seedrandom(gene.seed);
  const { randomize } = randomRangeFactory(randSrc);
  const simplex = makeNoise3D(randSrc);
  const gridBounds: Rect = [[0, 0], gene.gridSize];
  const bounds: Rect = [
    [MARGIN, MARGIN],
    [DIMENSION - MARGIN, DIMENSION - MARGIN],
  ];
  const { strokeWidth } = gene;

  const pallete = randomize(gene.pallete);

  const noiseFunc = (x: number, y: number, t: number) => {
    return Math.abs(
      simplex(
        gene.pointilism * x,
        gene.pointilism * y,
        gene.framePointilism * t,
      ),
    );
  };

  const generateWaveLayer = (
    frame: number,
    seed: string,
    hitChance: number = 1,
  ): Layer => {
    const randSrc = seedrandom(seed);
    const simplexShift = [lerp(0, 1000, randSrc()), lerp(0, 1000, randSrc())];
    const simplexHitChance = [
      lerp(0, 1000, randSrc()),
      lerp(0, 1000, randSrc()),
    ];

    const lines: Line[] = [];
    const hitMap: { [key: string]: boolean } = {};
    for (let i = gridBounds[0][0]; i <= gridBounds[1][0]; ++i) {
      for (let j = gridBounds[0][1]; j <= gridBounds[1][1]; ++j) {
        const c = clamp(
          noiseFunc(i + simplexShift[0], j + simplexShift[1], frame) / 0.75,
          0,
          1,
        );
        const amp = Math.round(lerp(...AMPLITUDE_RANGE, c));
        const l1: Cord = [i, j];
        const v: Vec2 = [randSrc(), randSrc()];
        const len = lenVec2(v);
        const relativeVector: Vec2 = [0, -1];
        const angle = Math.round(
          (Math.acos(dotMulVec2(v, relativeVector) / len) / (Math.PI * 2)) *
            360,
        );
        const discreteAngle = Math.floor(angle / 45) * 45;
        const directionVector = getDirectionVectorFromAngle(discreteAngle);
        // get clamped l2 point
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
        // check if line is overlapping
        let isLineOverlapping = false;
        for (let i = 0; i <= localAmp; ++i) {
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

        const h = clamp(
          noiseFunc(i + simplexHitChance[0], j + simplexHitChance[1], frame) /
            0.75,
          0,
          1,
        );
        if (h < hitChance && !isLineOverlapping) {
          lines.push([l1, l2]);
          const range =
            randSrc() < 0.5 || localAmp == 0
              ? [0, localAmp]
              : [1, localAmp - 1];
          for (let i = range[0]; i <= range[1]; ++i) {
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
      .map(
        (l) =>
          `M${l[0][0].toPrecision(5)} ${l[0][1].toPrecision(
            5,
          )}L${l[1][0].toPrecision(5)} ${l[1][1].toPrecision(5)}`,
      )
      .join(' ');
    return `<path d="${d}" opacity="1" stroke-width="${styles.strokeWidth}" stroke="${styles.color}" stroke-linecap="round" fill="transparent">${styles.animation}</path>`;
  };

  const getAnimationForFrame = (frame: number) => {
    return `<animate 
    attributeName="visibility"
    from="hidden"
    to="hidden"
    values="hidden; hidden; visible; visible; hidden; hidden; visible; visible; hidden; hidden;"
    animateMotion="discrete"
    keyTimes="0; ${(0.5 * frame) / gene.frameCt}; ${
      (0.5 * frame) / gene.frameCt
    }; ${(0.5 * (frame + 1)) / gene.frameCt}; ${
      (0.5 * (frame + 1)) / gene.frameCt
    }; ${0.5 + 0.5 * (1 - (frame + 1) / gene.frameCt)}; ${
      0.5 + 0.5 * (1 - (frame + 1) / gene.frameCt)
    }; ${0.5 + 0.5 * (1 - frame / gene.frameCt)}; ${
      0.5 + 0.5 * (1 - frame / gene.frameCt)
    }; 1"
    dur="${FRAME_DURATION * gene.frameCt}s"
    repeatCount="indefinite"
    />
    `;
  };

  const getPathFrame = (frame: number) => {
    return (
      convertLayerToPath(generateWaveLayer(frame, gene.seed + '0', 1), {
        color: pallete[1],
        strokeWidth,
        animation: getAnimationForFrame(frame),
      }) +
      convertLayerToPath(generateWaveLayer(frame, gene.seed + '1', 0.6), {
        color: pallete[2],
        strokeWidth,
        animation: getAnimationForFrame(frame),
      }) +
      convertLayerToPath(generateWaveLayer(frame, gene.seed + '2', 0.5), {
        color: pallete[3],
        strokeWidth,
        animation: getAnimationForFrame(frame),
      })
    );
  };

  const paths = newArray(gene.frameCt)
    .map((_: any, i: number) => getPathFrame(i))
    .join();

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${DIMENSION}" height="${DIMENSION}" viewBox="0 0 ${DIMENSION} ${DIMENSION}">` +
    `
    <style>
      path { mix-blend-mode: darken; }
    </style>` +
    `<rect opacity="0.5" fill="${pallete[0]}" x="0" y="0" width="${DIMENSION}" height="${DIMENSION}"/>` +
    paths +
    '</svg>'
  );
};
