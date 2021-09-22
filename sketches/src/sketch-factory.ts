import canvasSketch from 'canvas-sketch';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';

import { TokenMetadata } from './types';
import { DEFAULT_DRAW_SETTINGS } from './constants';
import { sketchCanvas } from './sketch';

export const sketchFactory = async (
  tokenMetadata: TokenMetadata,
  outFile: string,
  settings = DEFAULT_DRAW_SETTINGS,
) => {
  const canvasSketchSettings = settings.canvasSketchSettings;

  const canvas = createCanvas(
    canvasSketchSettings.dimensions[0],
    canvasSketchSettings.dimensions[1],
  );

  await canvasSketch(sketchCanvas(tokenMetadata, settings), {
    ...canvasSketchSettings,
    canvas,
  });
  const out = createWriteStream(outFile);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  await new Promise((res) => {
    out.on('finish', res);
  });
};
