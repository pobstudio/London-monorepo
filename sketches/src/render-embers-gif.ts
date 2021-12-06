import {
  Bound,
  computeEmbers,
  Cord,
  DEFAULT_GENE,
  DIMENSION,
  EmberGene,
  FRAME_DURATION,
  Line,
  Range,
  Rect,
  Vec2,
} from '.';
import Png from 'png-js';
import GifEncoder from 'gif-encoder';
import { convert } from 'convert-svg-to-png';

export const renderEmbersAsGif = async (
  gene: EmberGene = DEFAULT_GENE,
  writeStream: any,
) => {
  const { renderSvgAtFrame } = computeEmbers(gene);

  const gif = new GifEncoder(DIMENSION, DIMENSION);
  gif.pipe(writeStream);
  gif.writeHeader();
  gif.setRepeat(0);
  gif.setDelay(FRAME_DURATION * 1000);
  for (let i = 0; i < gene.frameCt; ++i) {
    const svg = renderSvgAtFrame(i);
    const png = await convert(svg);
    const pixels = await decode(png);
    gif.addFrame(pixels);
  }
  gif.finish();
};

function decode(data: any) {
  return new Promise((resolve) => {
    new Png(data).decode((pixels: any) => {
      resolve(pixels);
    });
  });
}
