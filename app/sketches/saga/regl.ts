import {
  newArray,
  Bound,
  Cord,
  Color,
  convertHexToColor,
  rectToBounds,
  rectToCorners,
  addVec2,
  subVec2,
  Cord3,
  Vec3,
  Vec2,
  convertHexToRGBA,
} from '../../../utils/src';
import createRegl, { Regl } from 'regl';

import flatten from 'lodash/flatten';
import { QuadProps, Gene } from './types';
import { GRID_BOUNDS } from './constants';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

const backgroundPositions = [
  [0, 0, 0],
  [GRID_BOUNDS[0], 0, 0],
  [0, GRID_BOUNDS[1], 0],
  [0, GRID_BOUNDS[1], 0],
  [GRID_BOUNDS[0], 0, 0],
  [GRID_BOUNDS[0], GRID_BOUNDS[1], 0],
] as Cord3[];

const backgroundQuadPropsPositions = backgroundPositions.map((p) => [
  p[0],
  p[1],
  p[2],
]);

const backgroundQuadIndexes = newArray(6, 0);
const backgroundUvPositions = backgroundPositions.map(
  (p) => [p[0] / GRID_BOUNDS[0], p[1] / GRID_BOUNDS[1]] as Cord,
);

export const sketch = (
  sketchContext: any,
  quadProps: QuadProps[],
  gene: Gene,
) => {
  const { gl, canvas } = sketchContext;

  const regl = createRegl({ gl });

  const { foreground } = gene;

  const createCommand = (positions: Vec3[], indexes: number[], uvs: Vec2[]) => {
    const command = regl({
      frag: FRAGMENT_SHADER,
      vert: VERTEX_SHADER,
      primitive: 'triangles',
      attributes: {
        position: positions,
        uv: uvs,
        index: indexes,
      },
      uniforms: {
        colorSeed: foreground.colorSeed,
        pointilism: foreground.pointilism,
        gapSize: foreground.gapSize,
        dotBounds: foreground.dotBounds,
        resolution: GRID_BOUNDS,
        colors: regl.texture(
          foreground.colors.map((c: string) => [convertHexToRGBA(c)]),
        ),
        opacity: 1,
      },
      depth: {
        enable: true,
        mask: false,
        func: 'lequal',
        range: [0, 1],
      },
      count: positions.length,
    });

    return (props: any[]) => {
      command(
        props.map((p: any, i: number) => {
          return {};
        }),
      );
    };
  };

  const getAttributes = () => {
    const props = quadProps;
    const quadPropsPositions = flatten(
      props.map((q, i) =>
        q.position.map(
          (p) => [p[0], p[1], (i + 1) / (props.length + 1)] as Cord3,
        ),
      ),
    );
    const quadIndexes = flatten(
      props.map((q, i) => newArray(q.position.length, i + 1) as number[]),
    );
    const quadPropsUvPositions = flatten(
      props.map((q) =>
        q.position.map(
          (p) => [p[0] / GRID_BOUNDS[0], p[1] / GRID_BOUNDS[1]] as Cord,
        ),
      ),
    );

    // return {
    //   positions: [...backgroundQuadPropsPositions] as Vec3[],
    //   quadIndexes: [...backgroundQuadIndexes] as number[],
    //   uvs: [...backgroundUvPositions] as Vec2[],
    // };

    return {
      positions: [
        ...backgroundQuadPropsPositions,
        ...quadPropsPositions,
      ] as Vec3[],
      quadIndexes: [...backgroundQuadIndexes, ...quadIndexes] as number[],
      uvs: [...backgroundUvPositions, ...quadPropsUvPositions] as Vec2[],
    };
  };

  return {
    context: sketchContext,
    render: () => {
      const { positions, quadIndexes, uvs } = getAttributes();

      const draw = createCommand(positions, quadIndexes, uvs);

      // Update regl sizes
      regl.poll();

      draw([{}]);
    },
    end: () => {
      regl.destroy();
    },
  };
};
