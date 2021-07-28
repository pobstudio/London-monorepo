import { Complexity, Composition, Rarity } from './constants';
import { TileSet } from './data/tiles';

// token types
export interface TokenMetadata {
  seed: number;
  tileSet: TileSet;
  framed: 'yay' | 'nay';
  composition: Composition;
  rarity: Rarity;
  complexity: Complexity;
}

// geometry types
export declare type Line = [Cord, Cord];
export declare type Rect = [Cord, Cord];
export declare type Triangle = [Cord, Cord, Cord];
export declare type RectByTriangle = [Triangle, Triangle];
export declare type RectByCorner = [Cord, Cord, Cord, Cord];
export declare type Bound = [number, number];
export declare type Range = [number, number];
export declare type Vec2 = [number, number];
export declare type Cord = [number, number];
export declare type Polygon = Cord[];
export declare type Color = [number, number, number, number];
// WFC specific types
export declare type TilePolygons = Polygon[];
export interface TileSideSocket {
  // min, max
  position: [number, number];
  type: string;
}
export interface Tile {
  sockets: [
    TileSideSocket[],
    TileSideSocket[],
    TileSideSocket[],
    TileSideSocket[],
  ];
  polygons: TilePolygons;
  polygonRegions: string[];
}

export interface Node {
  adjacencyMatrix: number[][];
}

export declare type TileDrawFunc = (ctx: any, r: Rect) => void;

// canvas-sketch types
export interface SketchContext {
  canvas: HTMLCanvasElement;
  context: any;
  width: number;
  height: number;
  styleWidth: number;
  styleHeight: number;
  frame: number;
  playhead?: number;
  time?: number;
  settings: any;
  step: number;
  fps: number;
  recording?: boolean;
  gl: any;
}

export interface Animation {
  startDelayInTicks: number;
  durationInTicks: number;
  endDelayInTicks: number;
  props: any;
  type: string;
  subAnimations: Animation[];
}
//# sourceMappingURL=types.d.ts.map
