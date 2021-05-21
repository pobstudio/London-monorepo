import {
  subVec2,
  Line,
  Vec2,
  Bound,
  Cord,
  Rect,
  addVec2,
  lenVec2,
  lerp,
  newArray,
  randomRangeFactory,
  normVec2,
  mulVec2,
  Color,
  convertHexToColor,
  colors as defaultColors,
  dotMulVec2,
  rectToBounds,
  Quad,
  isCordInRectExhaustive,
} from '../../../utils/src';
import SimplexNoise from 'simplex-noise';
import seedrandom from 'seedrandom';
import clamp from 'lodash/clamp';
import {
  getDirectionIndexFromVector,
  getDirectionVectorFromAngle,
  getOppositeIndexFromDirectionIndex,
} from './utils';
import { randomVectorFieldBySeed } from './vector';
import { QuadProps, Strand, Gene } from './types';
import {
  CIRCLE_RADIANS,
  MIN_STRAND_PROPS_FROM_COMPOSITION,
  GRID_BOUNDS,
} from './constants';

export const prerender = (gene: Gene): QuadProps[] => {
  const rand = seedrandom(gene.seed);
  const { random, randomInArray } = randomRangeFactory(rand);
  const simplex = new SimplexNoise(gene.seed);

  const getUnitCircle = (center: Cord, radius: number) => {
    const unitCircleTriangles: Cord[] = [];
    for (let i = 0; i < Math.PI * 2; i += CIRCLE_RADIANS) {
      unitCircleTriangles.push(center);
      unitCircleTriangles.push(
        addVec2(center, [radius * Math.cos(i), radius * Math.sin(i)]),
      );
      unitCircleTriangles.push(
        addVec2(center, [
          radius * Math.cos(i + CIRCLE_RADIANS),
          radius * Math.sin(i + CIRCLE_RADIANS),
        ]),
      );
    }
    return unitCircleTriangles;
  };

  const getCompositionFactory = (seed: string) => {
    const vectorField = randomVectorFieldBySeed(seed);

    const createStrand = (startCord: Cord, length: number = 100) => {
      let currentCord: Cord = startCord;
      let lineSegment: Cord[] = [currentCord];
      // let closerInfluence = 0;
      const relativeVector: Vec2 = [0, -1];

      for (let i = 0; i < length; i++) {
        const v = vectorField(
          mulVec2(currentCord, [
            gene.composition.pointilism,
            gene.composition.pointilism,
          ]),
        );
        // console.log('v', v, mulVec2(currentCord, [pointilism, pointilism]));
        const len = lenVec2(v);
        const angle = Math.round(
          (Math.acos(dotMulVec2(v, relativeVector) / len) / (Math.PI * 2)) *
            360,
        );
        const discreteAngle = Math.floor(angle / 45) * 45;
        const directionVector = getDirectionVectorFromAngle(discreteAngle);
        // console.log(v, angle, discreteAngle, directionVector);
        currentCord = [
          clamp(currentCord[0] + directionVector[0], 0, GRID_BOUNDS[0]),
          clamp(currentCord[1] + directionVector[1], 0, GRID_BOUNDS[1]),
        ];
        if (
          currentCord[0] !== lineSegment[lineSegment.length - 1][0] ||
          currentCord[1] !== lineSegment[lineSegment.length - 1][1]
        ) {
          lineSegment.push(currentCord);
        }
      }
      let lines: Line[] = [];
      for (let i = 0; i < lineSegment.length - 1; ++i) {
        lines.push([lineSegment[i], lineSegment[i + 1]]);
      }
      return lines;
    };

    const getReducedStrand = (lines: Line[]): Line[] => {
      if (lines.length === 1) {
        return lines;
      }
      let reducedLines: Line[] = [];
      let hasCombined = false;
      for (let i = 0; i < lines.length - 1; i += 2) {
        const currentDirectionIndex = getDirectionIndexFromVector(
          subVec2(lines[i][1], lines[i][0]),
        );
        const nextDirectionIndex = getDirectionIndexFromVector(
          subVec2(lines[i + 1][1], lines[i + 1][0]),
        );
        // same vector of movement, meaning can be merged
        if (currentDirectionIndex === nextDirectionIndex) {
          reducedLines.push([lines[i][0], lines[i + 1][1]]);
          hasCombined = true;
          // handle case where the vector goes back towards the direction it originally came from
        } else if (
          getOppositeIndexFromDirectionIndex(currentDirectionIndex) ===
          nextDirectionIndex
        ) {
          // if the two lines don't end at the same pt, add line, if does skip
          if (
            lines[i][0][0] !== lines[i + 1][1][0] ||
            lines[i][0][1] !== lines[i + 1][1][1]
          ) {
            reducedLines.push([lines[i][0], lines[i + 1][1]]);
          }
          hasCombined = true;
        } else {
          reducedLines.push(lines[i]);
          reducedLines.push(lines[i + 1]);
        }
      }
      // handle odd number case
      if (reducedLines.length !== 0 && lines.length % 2 === 1) {
        const lastReducedLine = reducedLines.pop();

        const rearLines = getReducedStrand([
          lastReducedLine as Line,
          lines[lines.length - 1],
        ]);
        if (rearLines.length === 1) {
          hasCombined = true;
        }
        reducedLines = [...reducedLines, ...rearLines];
      }

      return hasCombined ? getReducedStrand(reducedLines) : lines;
    };

    const createAndReduceStrand = (
      startCord: Cord,
      length: number = 100,
    ): Strand => {
      const strand = createStrand(startCord, length);
      // console.log('s', strand);
      const reducedStrand = getReducedStrand(strand);
      // console.log('r', reducedStrand)
      // console.log('s -> e', startCord, reducedStrand.length);
      return {
        line: reducedStrand,
      };
    };

    // cleans 0x prefix if needed
    const getHexOpCodeTape = (hexStr: string) => {
      if (hexStr.startsWith('0x')) {
        return hexStr.slice(2);
      }
      return hexStr;
    };

    const createComposition = (compositionSeed: string) => {
      const tape = getHexOpCodeTape(compositionSeed);
      let tapeIndex = 0;
      const getComposition = (
        rect: Rect = [[0, 0], GRID_BOUNDS],
        stepSize: number = 1,
        length: number = 25,
      ): Strand[] => {
        const opcode = tape[tapeIndex];
        tapeIndex++;
        const strands: Strand[] = [];
        if (opcode === '0') {
          return [
            ...getComposition(rect, stepSize * 2, length),
            ...getComposition(rect, stepSize, length),
          ];
        }
        if (opcode === '1') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 2) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 2) {
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // looser grid
        if (opcode === '2') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 8) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 2) {
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // looser grid
        if (opcode === '3') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 2) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 8) {
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // fine long grid
        if (opcode === '4') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 1) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 16) {
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // fine long grid
        if (opcode === '5') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 16) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 1) {
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // border grid
        if (opcode === '6') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 1) {
            strands.push(createAndReduceStrand([i, rect[0][1]], length));
          }
          for (let i = rect[0][0]; i < rect[1][0]; i += 1) {
            strands.push(createAndReduceStrand([i, rect[1][1]], length));
          }
          for (let i = rect[0][1]; i < rect[1][1]; i += 1) {
            strands.push(createAndReduceStrand([rect[0][0], i], length));
          }
          for (let i = rect[0][1]; i < rect[1][1]; i += 1) {
            strands.push(createAndReduceStrand([rect[1][0], i], length));
          }
        }
        // diag grid
        if (opcode === '7') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 2) {
            for (let j = i; j < rect[1][1]; j += 2) {
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // diag grid
        if (opcode === '8') {
          for (let i = rect[0][1]; i < rect[1][1]; i += 2) {
            for (let j = i; j < rect[1][0]; j += 2) {
              strands.push(createAndReduceStrand([j, i], length));
            }
          }
        }
        // frame
        if (opcode === '9') {
          const bounds = rectToBounds(rect);

          for (let i = rect[0][0]; i < rect[1][0]; i += 2) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 2) {
              if (
                i > Math.round(bounds[0] * 0.25) + rect[0][0] &&
                i < Math.round(bounds[0] * 0.75) + rect[0][0]
              ) {
                break;
              }
              if (
                j > Math.round(bounds[1] * 0.25) + rect[0][1] &&
                j < Math.round(bounds[1] * 0.75) + rect[0][1]
              ) {
                break;
              }
              strands.push(createAndReduceStrand([i, j], length));
            }
          }
        }
        // simplex
        if (opcode === 'a') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 2) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 2) {
              const simplexCoeff = simplex.noise2D(
                ...([i * 0.01, j * 0.01] as Cord),
              );
              if (Math.abs(simplexCoeff) < 0.12) {
                strands.push(createAndReduceStrand([i, j], length));
              }
            }
          }
        }
        // simplex
        if (opcode === 'b') {
          for (let i = rect[0][0]; i < rect[1][0]; i += 2) {
            for (let j = rect[0][1]; j < rect[1][1]; j += 2) {
              const simplexCoeff = simplex.noise2D(
                ...([i * 0.01, j * 0.01] as Cord),
              );
              if (Math.abs(simplexCoeff) > 0.12) {
                strands.push(createAndReduceStrand([i, j], length));
              }
            }
          }
        }
        // length in half
        if (opcode === 'c') {
          return getComposition(
            rect,
            stepSize,
            Math.max(1, Math.round(length / 2)),
          );
        }
        if (opcode === 'd') {
          return getComposition(
            rect,
            stepSize,
            Math.max(1, Math.round(length / 2)),
          );
        }
        if (opcode === 'e') {
          return [
            ...getComposition(
              [rect[0], [Math.floor(rect[1][0] / 2), rect[1][1]]],
              stepSize,
              length,
            ),
            ...getComposition(
              [[Math.floor(rect[1][0] / 2), rect[0][1]], rect[1]],
              stepSize,
              length,
            ),
          ];
        }
        if (opcode === 'f') {
          return [
            ...getComposition(
              [rect[0], [rect[1][0], Math.floor(rect[1][1] / 2)]],
              stepSize,
              length,
            ),
            ...getComposition(
              [[rect[0][0], Math.floor(rect[1][1] / 2)], rect[1]],
              stepSize,
              length,
            ),
          ];
        }
        return strands;
      };
      return getComposition;
    };
    return {
      createComposition,
    };
  };

  const convertStrandsToQuadProps = (strands: Strand[]) => {
    let quads: Quad[] = [];
    for (let j = 0; j < strands.length; ++j) {
      const strand = strands[j];
      for (let i = 0; i < strand.line.length - 1; ++i) {
        const line1 = strand.line[i];
        const line2 = strand.line[i + 1];
        quads.push(convertLinesToQuad(line1, line2));
      }
    }
    // return (quads).map(convertQuadToQuadProps)// .slice(0, 100);
    return pruneOverlappedQuads(quads).map(convertQuadToQuadProps);
  };

  const getZNormal = (vec1: Vec2, vec2: Vec2) => {
    return vec1[0] * vec2[1] - vec1[1] * vec2[0];
  };

  const getPosNormalTriangle = (tri: [Cord, Cord, Cord]) => {
    const vec1 = subVec2(tri[1], tri[0]);
    const vec2 = subVec2(tri[2], tri[0]);
    const zNormal = getZNormal(vec1, vec2);
    if (zNormal >= 0) {
      return tri;
    }
    return [tri[1], tri[0], tri[2]];
  };

  const convertLinesToQuad = (line1: Line, line2: Line): Quad => {
    const vec1 = subVec2(line1[1], line1[0]);
    const flipVec1 = mulVec2(vec1, [-1, -1]);
    const ptToAddFrom = line2[1];
    const pt4 = addVec2(ptToAddFrom, flipVec1);

    return [line1[1], line1[0], line2[1], pt4];
  };

  const convertQuadToQuadProps = (quad: Quad): QuadProps => {
    return {
      position: [
        ...getPosNormalTriangle([quad[0], quad[1], quad[2]]),
        ...getPosNormalTriangle([quad[3], quad[1], quad[2]]),
      ],
    };
  };

  const pruneOverlappedQuads = (quads: Quad[]): Quad[] => {
    const prunedQuads: Quad[] = [];
    for (let i = 0; i < quads.length; ++i) {
      let isOverlapped = false;
      inner: for (let j = i + 1; j < quads.length; ++j) {
        // check cord 1
        if (
          isCordInRectExhaustive([quads[j][0], quads[j][3]], quads[i][0]) &&
          isCordInRectExhaustive([quads[j][1], quads[j][2]], quads[i][1]) &&
          isCordInRectExhaustive([quads[j][1], quads[j][2]], quads[i][2]) &&
          isCordInRectExhaustive([quads[j][0], quads[j][3]], quads[i][3])
        ) {
          // console.log(
          //   '0',
          //   isCordInRectExhaustive([quads[j][0], quads[j][3]], quads[i][0]),
          //   quads[j][0],
          //   quads[j][3],
          //   quads[i][0],
          // );
          // console.log(
          //   '1',
          //   isCordInRectExhaustive([quads[j][0], quads[j][3]], quads[i][3]),
          //   quads[j][0],
          //   quads[j][3],
          //   quads[i][3],
          // );
          // console.log(
          //   '2',
          //   isCordInRectExhaustive([quads[j][1], quads[j][2]], quads[i][1]),
          //   quads[j][1],
          //   quads[j][2],
          //   quads[i][1],
          // );
          // console.log(
          //   '3',
          //   isCordInRectExhaustive([quads[j][1], quads[j][2]], quads[i][2]),
          //   quads[j][1],
          //   quads[j][2],
          //   quads[i][2],
          // );
          isOverlapped = true;
          break inner;
        }
      }
      if (!isOverlapped) {
        prunedQuads.push(quads[i]);
      }
    }
    console.log(quads.length, 'prunedQuads.length', prunedQuads.length);
    return prunedQuads;
  };

  const injectCirclesToQuadProps = (quadProps: QuadProps[]) => {
    let injectedQuadProps = [...quadProps];
    for (let i = 0; i < gene.composition.numCircles; ++i) {
      const randomIndex = random(
        0,
        Math.round(injectedQuadProps.length),
        'int',
      );
      const circleCenter: Cord = [
        random(0, GRID_BOUNDS[0] / 4, 'int') * 4,
        random(0, GRID_BOUNDS[1] / 4, 'int') * 4,
      ];
      const circleRadiusBump = lerp(6, 0, Math.min(1, quadProps.length / 1000));
      const circleRadius = random(
        gene.composition.circleRange[0],
        gene.composition.circleRange[1] + circleRadiusBump,
        'int',
      );
      const circlePositions = getUnitCircle(circleCenter, circleRadius);
      const circleQuadProps: QuadProps = {
        position: circlePositions,
      };
      injectedQuadProps.splice(randomIndex, 0, circleQuadProps);
    }
    return injectedQuadProps;
  };

  const getStrandsWithVisuals = (seed: string) => {
    const factory = getCompositionFactory(seed);
    const strands = factory.createComposition(seed)([[0, 0], GRID_BOUNDS]);
    const strandQuadProps = convertStrandsToQuadProps(strands);
    // MIN THRESHOLD OF STRANDS
    if (strandQuadProps.length > MIN_STRAND_PROPS_FROM_COMPOSITION) {
      return strandQuadProps;
    }
    for (let i = 0; i < 20; ++i) {
      const factory = getCompositionFactory(seed + i);
      const strands = factory.createComposition(seed)([[0, 0], GRID_BOUNDS]);
      const strandQuadProps = convertStrandsToQuadProps(strands);
      if (strandQuadProps.length > MIN_STRAND_PROPS_FROM_COMPOSITION) {
        return strandQuadProps;
      }
    }
    return strandQuadProps;
  };

  const strandQuadProps = getStrandsWithVisuals(gene.seed);

  const quadProps = injectCirclesToQuadProps(strandQuadProps);

  return quadProps;
};
