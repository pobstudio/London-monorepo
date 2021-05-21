import {
  subVec2,
  Cord3,
  Vec2,
  Bound,
  Cord,
  Rect,
  addVec2,
  lenVec2,
  lerp,
  newArray,
  normVec2,
  mulVec2,
  Color,
  convertHexToColor,
  convertHexToRGBA,
  colors as defaultColors,
  dotMulVec2,
  rectToBounds,
  Range,
} from '../../../utils/src';
import * as THREE from 'three';
import { extend, useThree } from '@react-three/fiber';
import glslify from 'glslify';
import React, { FC, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { clamp, flatten } from 'lodash';
import createRegl, { Regl, Texture2D } from 'regl';
import { useMountedState } from 'react-use';
import {
  getDirectionIndexFromVector,
  getDirectionVector,
  getDirectionVectorFromAngle,
  getOppositeIndexFromDirectionIndex,
} from './utils';
import { BreadcrumbJsonLd } from 'next-seo';
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';
import { QuadProps, Strand, GeneWithTxData } from './types';
import { prerender } from './prerender';
import { useMemo } from 'react';
import { GRID_BOUNDS } from './constants';
import { shaderMaterial } from '@react-three/drei';
import { useLayoutEffect } from 'react';
import { forwardRef } from 'react';
import { NextRouter, withRouter } from 'next/router';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

interface SagaMaterialUniforms {
  colorSeed: number;
  pointilism: number;
  gapSize: number;
  dotBounds: THREE.Vec2;
  colors: THREE.Texture;
  opacity: number;
}

const convertColorsToThreeTexture = (colors: string[]) => {
  const rgbas = colors.map(convertHexToRGBA);
  const data = new Uint8Array(rgbas.length * 4);
  for (let i = 0; i < rgbas.length; i++) {
    const stride = i * 4;
    data[stride + 0] = rgbas[i][0];
    data[stride + 1] = rgbas[i][1];
    data[stride + 2] = rgbas[i][2];
    data[stride + 3] = rgbas[i][3];
  }
  return new THREE.DataTexture(data, 1, rgbas.length, THREE.RGBAFormat);
};

const SagaMaterial = shaderMaterial(
  {
    colorSeed: 6,
    pointilism: 5,
    dotBounds: new THREE.Vector2(0.00003, 0.002),
    gapSize: 0.002,
    colors: convertColorsToThreeTexture([
      '#142850',
      '#27496d',
      '#00909e',
      '#dae1e7',
    ]),
    opacity: 1,
  },
  // vertex shader
  glslify`
varying vec2 vUv;
varying float polyIndex;

attribute float index;

void main() {
  vUv = uv;
  polyIndex = index;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
  // fragment shader
  FRAGMENT_SHADER,
);

extend({ SagaMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sagaMaterial: any;
    }
  }
}

const BOUNDING_BOX = new THREE.Box3(
  new THREE.Vector3(GRID_BOUNDS[0] / -2, GRID_BOUNDS[1] / -2, 0),
  new THREE.Vector3(GRID_BOUNDS[0] / 2, GRID_BOUNDS[1] / 2, 0),
);

const SagaContextMemo = forwardRef<
  any,
  MeshProps & {
    onClick?: () => void;
    prerenderPayload: any;
    onSync?: () => void;
  }
>(({ prerenderPayload, onClick, onSync, ...props }, ref) => {
  // for now assume there is only one layer
  const [positions, quadIndexes, uvs] = useMemo(() => {
    const quadProps = prerenderPayload.data as QuadProps[];
    const quadPropsPositions = flatten(
      quadProps.map((q, i) =>
        q.position.map(
          (p) =>
            [
              p[0] - GRID_BOUNDS[0] / 2,
              p[1] - GRID_BOUNDS[1] / 2,
              i + 1,
            ] as Cord3,
        ),
      ),
    );
    const quadIndexes = flatten(
      quadProps.map((q, i) => newArray(q.position.length, i + 1) as number[]),
    );
    const quadPropsUvPositions = flatten(
      quadProps.map((q) =>
        q.position.map(
          (p) => [p[0] / GRID_BOUNDS[0], p[1] / GRID_BOUNDS[1]] as Cord,
        ),
      ),
    );

    const backgroundPositions = [
      [0, 0, 0],
      [GRID_BOUNDS[0], 0, 0],
      [0, GRID_BOUNDS[1], 0],
      [0, GRID_BOUNDS[1], 0],
      [GRID_BOUNDS[0], 0, 0],
      [GRID_BOUNDS[0], GRID_BOUNDS[1], 0],
    ] as Cord3[];

    const backgroundQuadPropsPositions = backgroundPositions.map((p) => [
      p[0] - GRID_BOUNDS[0] / 2,
      p[1] - GRID_BOUNDS[1] / 2,
      p[2],
    ]);

    const backgroundQuadIndexes = newArray(6, 0);
    const backgroundUvPositions = backgroundPositions.map(
      (p) => [p[0] / GRID_BOUNDS[0], p[1] / GRID_BOUNDS[1]] as Cord,
    );

    return [
      new Float32Array(
        flatten([...backgroundQuadPropsPositions, ...quadPropsPositions]),
      ),
      new Float32Array([...backgroundQuadIndexes, ...quadIndexes]),
      new Float32Array(
        flatten([...backgroundUvPositions, ...quadPropsUvPositions]),
      ),
    ];
  }, [prerenderPayload]);

  const uniforms: SagaMaterialUniforms = useMemo(() => {
    const gene = prerenderPayload.gene as GeneWithTxData;

    return {
      colorSeed: gene.foreground.colorSeed,
      pointilism: gene.foreground.pointilism,
      dotBounds: new THREE.Vector2(...gene.foreground.dotBounds),
      gapSize: gene.foreground.gapSize,
      colors: convertColorsToThreeTexture(gene.foreground.colors),
      opacity: 1,
    };
  }, [prerenderPayload]);

  return (
    <mesh onClick={onClick} ref={ref} {...props}>
      <bufferGeometry attach="geometry" boundingBox={BOUNDING_BOX}>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'index']}
          count={quadIndexes.length}
          array={quadIndexes}
          itemSize={1}
        />
        <bufferAttribute
          attachObject={['attributes', 'uv']}
          count={uvs.length / 2}
          array={uvs}
          itemSize={2}
        />
      </bufferGeometry>
      <sagaMaterial attach="material" {...uniforms} />
    </mesh>
  );
});

const SagaContext = React.memo(SagaContextMemo);

export default SagaContext;
