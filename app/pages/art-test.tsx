import React, { useRef } from 'react';
import { NextPage } from 'next';
import { sketchFactoryRaw } from '@pob/sketches';
import { useEffect } from 'react';

const DEFAULT_DIMENSIONS = [2048, 2048];

const DEFAULT_DRAW_SETTINGS = {
  canvasSketchSettings: {
    dimensions: DEFAULT_DIMENSIONS,
  },
  marginInUnit: 48,
};

const TestArt: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    (async () => {
      if (canvasRef.current) {
        const factory = sketchFactoryRaw(
          {
            seed: 6111998,
            tileSet: 'squiggle',
            framed: 'nay',
            composition: 'random',
            rarity: 'secretRare',
            complexity: 'super_complex',
          },
          DEFAULT_DRAW_SETTINGS,
        );
        await factory(canvasRef.current);
      }
    })();
  }, [canvasRef.current]);
  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default React.memo(TestArt);
