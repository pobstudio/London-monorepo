import { Line, Cord, Bound } from '../../../utils/src';
import { Texture2D } from 'regl';
import { TxData as BaseTxData } from '../utils';

export interface QuadProps {
  position: Cord[];
}

export interface BatchQuadProps {
  position: Cord[];
  index: number[];
  colors: Texture2D;
  numQuads: number;
  colorSeed: number;
}

export interface Strand {
  line: Line[];
}

export interface TxData extends BaseTxData {
  from: string;
  to: string;
}

export interface Gene {
  seed: string;
  foreground: {
    colorSeed: number;
    colors: string[];
    pointilism: number;
    dotBounds: Bound;
    gapSize: number;
  };
  composition: {
    numCircles: number;
    circleRange: Bound;
    pointilism: number;
  };
}

export interface GeneWithTxData extends Gene, TxData {}
