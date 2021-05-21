import React, { FC, useRef, useEffect, useMemo } from 'react';
import { useSpring } from 'react-spring';
import { useRafLoop } from 'react-use';
import { ParallaxCanvasProps, SketchCanvas } from '../common';
import { sketch } from './sketch';
import { DIMENSIONS } from './types';

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

  const { springDelta } = useSpring({
    springDelta: useMemo(() => delta ?? [0, 0], [delta]),
    config: { mass: 1, tension: 40, friction: 10 },
  });

  const [stopLoop, startLoop, isLoopActive] = useRafLoop(() => {
    if (isParallax && !!sketcherRef.current) {
      const sketcher = sketcherRef.current;
      sketcher.render(springDelta.getValue());
    }
  });

  useEffect(() => {
    if (shouldEnableRAFLoop && !isLoopActive()) {
      startLoop();
    } else if (!shouldEnableRAFLoop && isLoopActive()) {
      stopLoop();
    }
  }, [shouldEnableRAFLoop]);

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
  }, [isParallax, onHasDrawn, sketcherRef, prerenderPayload]);

  return <SketchCanvas ref={canvasRef} />;
};

export const Canvas = React.memo(UnMemoizedCanvas);
