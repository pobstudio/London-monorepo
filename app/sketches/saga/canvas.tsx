import React, { FC, useRef, useEffect, useMemo } from 'react';
import { useSpring } from 'react-spring';
import { useRafLoop } from 'react-use';
import { ParallaxCanvasProps, SketchCanvas } from '../common';
import { sketch } from './regl';
import { DIMENSIONS } from './constants';

const UnMemoizedCanvas: FC<ParallaxCanvasProps> = ({
  shouldEnableRAFLoop,
  delta,
  isParallax,
  onHasDrawn,
  prerenderPayload,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sketcherRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    console.log(DIMENSIONS);
    canvasRef.current.width = DIMENSIONS[0];
    canvasRef.current.height = DIMENSIONS[1];
    const gl = canvasRef.current.getContext('webgl');
    const sketchContext = {
      gl,
      width: DIMENSIONS[0],
      height: DIMENSIONS[1],
    };

    const sketcher = sketch(
      sketchContext,
      prerenderPayload.data,
      prerenderPayload.gene,
    );

    sketcherRef.current = sketcher;
  }, [canvasRef]);

  // const { springDelta } = useSpring({
  //   springDelta: useMemo(() => delta ?? [0, 0], [delta]),
  //   config: { mass: 1, tension: 40, friction: 10 },
  // });

  // const [stopLoop, startLoop, isLoopActive] = useRafLoop(() => {
  //   if (isParallax && !!sketcherRef.current) {
  //     const sketcher = sketcherRef.current;
  //     sketcher.render(springDelta.getValue());
  //   }
  // });

  // useEffect(() => {
  //   if (shouldEnableRAFLoop && !isLoopActive()) {
  //     startLoop();
  //   } else if (!shouldEnableRAFLoop && isLoopActive()) {
  //     stopLoop();
  //   }
  // }, [shouldEnableRAFLoop]);

  useEffect(() => {
    if (!sketcherRef.current) {
      return;
    }

    // if (hasDrawn) {
    //   return;
    // }

    // setHasDrawn(true);
    onHasDrawn?.();
    const sketcher = sketcherRef.current;

    if (!isParallax) {
      sketcher.render();
    }

    return () => {
      sketcher.end();
      // if (!!sketcherRef.current.context.gl) {
      //   sketcherRef.current.context.gl.getExtension('WEBGL_lose_context')?.loseContext();
      // }
    };
  }, [onHasDrawn, prerenderPayload]);

  return <SketchCanvas ref={canvasRef} />;
};

export const Canvas = React.memo(UnMemoizedCanvas);

// import { Canvas as R3FCanvas } from '@react-three/fiber';
// import { useMemo } from 'react';
// import { FC } from 'react';
// import styled from 'styled-components';
// import { DIMENSIONS, GRID_BOUNDS } from '../../sketches/saga/constants';
// import * as THREE from 'three';
// import dynamic from 'next/dynamic';
// import { CanvasProps, ParallaxCanvasProps } from '../common';
// import { useEffect } from 'react';
// import { useMeasure } from 'react-use';
// import { Plane } from '@react-three/drei';
// import SagaContext from '../../sketches/saga/three';
// import { Vector3 } from 'three';

// // const SagaContext = dynamic(() => import('../../sketches/saga/three'), {
// //   ssr: false,
// // });

// const CanvasContainer = styled.div`
//   width: 100%;
//   height: 100%;
//   position: relative;
// `;

// const POSITION: Vector3 = new Vector3(...[0, 0, 0]);

// export const Canvas: FC<ParallaxCanvasProps & { dpr: number }> = ({
//   prerenderPayload,
//   onHasDrawn,
//   dpr,
// }) => {
//   const camera = useMemo(() => {
//     const camera = new THREE.OrthographicCamera(
//       (1 * GRID_BOUNDS[0]) / -2,
//       (1 * GRID_BOUNDS[0]) / 2,
//       (1 * GRID_BOUNDS[1]) / 2,
//       (1 * GRID_BOUNDS[1]) / -2,
//       0.1,
//       1000000.1,
//     );
//     camera.position.set(0, 0, 1000000);
//     camera.lookAt(0, 0, 0);
//     return camera;
//   }, []);

//   useEffect(() => {
//     onHasDrawn?.();
//   }, [onHasDrawn]);

//   return (
//     <R3FCanvas style={{zIndex: 1}} dpr={dpr} orthographic camera={camera}>
//       <SagaContext
//         key={`saga-${prerenderPayload.gene.seed}`}
//         prerenderPayload={prerenderPayload}
//         position={POSITION}
//       />
//     </R3FCanvas>
//   );
// };
