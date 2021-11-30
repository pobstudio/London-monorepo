import {
  TilePolygons,
  TileSideSocket,
  Tile,
  Node,
  Bound,
  Cord,
  Line,
  Polygon,
  TileDrawFunc,
  Rect,
  SketchContext,
} from '../types';
import {
  getPolygonAsLines,
  getRectBounds,
  getRectCorners,
  scaleCord,
} from '../utils/geometry';
import { clamp, flatten, uniqBy } from 'lodash';
import { addVec2, getPermutations, mulVec2, subVec2 } from '../utils/math';

export const getTiles = (tilePolygons: TilePolygons[], regions: string[]) => {
  const regionPermutations = getPermutations(regions);

  const getSideIndex = (line: Line) => {
    if (line[0][0] === line[1][0] && line[0][1] === line[1][1]) {
      return undefined;
    }
    if (line[0][1] === 0 && line[1][1] === 0) {
      return 0;
    }
    if (line[0][0] === 1 && line[1][0] === 1) {
      return 1;
    }
    if (line[0][1] === 1 && line[1][1] === 1) {
      return 2;
    }
    if (line[0][0] === 0 && line[1][0] === 0) {
      return 3;
    }
    return undefined;
  };

  const getTiles = (tilePolygons: TilePolygons) => {
    const tiles: Tile[] = [];
    const permutations = uniqBy(
      regionPermutations.map((p) => p.slice(0, tilePolygons.length)),
      (p) => p.join('-'),
    );
    for (const permutation of permutations) {
      const tile: Tile = {
        sockets: [[], [], [], []],
        polygons: tilePolygons,
        polygonRegions: permutation,
      };
      for (let i = 0; i < tilePolygons.length; ++i) {
        const polygonSides = getPolygonAsLines(tilePolygons[i]);
        for (const side of polygonSides) {
          const tileIndex = getSideIndex(side);
          if (tileIndex !== undefined) {
            const position: Cord = (
              tileIndex === 0 || tileIndex === 2
                ? [side[0][0], side[1][0]]
                : [side[0][1], side[1][1]]
            ).sort((a, b) => a - b) as Cord;
            tile.sockets[tileIndex].push({
              position,
              type: permutation[i],
            });
          }
        }
      }
      tiles.push(tile);
    }

    return tiles;
  };

  return flatten(tilePolygons.map(getTiles));
};

export const getNodes = (tiles: Tile[]): Node[] => {
  const isTileSidesCompatible = (
    side1: TileSideSocket[],
    side2: TileSideSocket[],
  ) => {
    for (const side1Socket of side1) {
      let isCompatible = false;
      for (const side2Socket of side2) {
        if (
          side1Socket.type === side2Socket.type &&
          side1Socket.position[0] === side2Socket.position[0] &&
          side1Socket.position[1] === side2Socket.position[1]
        ) {
          isCompatible = true;
          break;
        }
      }
      if (!isCompatible) {
        return false;
      }
    }
    return true;
  };

  return tiles.map((tile) => {
    return {
      adjacencyMatrix: [
        tiles.reduce(
          (a, c, i) =>
            isTileSidesCompatible(tile.sockets[0], c.sockets[2])
              ? [...a, i]
              : a,
          [] as number[],
        ),
        tiles.reduce(
          (a, c, i) =>
            isTileSidesCompatible(tile.sockets[1], c.sockets[3])
              ? [...a, i]
              : a,
          [] as number[],
        ),
        tiles.reduce(
          (a, c, i) =>
            isTileSidesCompatible(tile.sockets[2], c.sockets[0])
              ? [...a, i]
              : a,
          [] as number[],
        ),
        tiles.reduce(
          (a, c, i) =>
            isTileSidesCompatible(tile.sockets[3], c.sockets[1])
              ? [...a, i]
              : a,
          [] as number[],
        ),
      ],
    };
  });
};

export const getTileDrawFunc = (tiles: Tile[]) => {
  return tiles.map((t) => (ctx: any, r: Rect) => {
    t.polygons.forEach((p, i) => {
      ctx.fillStyle = t.polygonRegions[i];
      ctx.beginPath();
      p.forEach((c, i) => {
        const scaledCord = scaleCord(
          c,
          [
            [0, 0],
            [1, 1],
          ],
          r,
        );
        const roundedCord = [
          Math.round(scaledCord[0]),
          Math.round(scaledCord[1]),
        ];

        if (i === 0) {
          ctx.moveTo(...roundedCord);
        } else {
          ctx.lineTo(...roundedCord);
        }
      });
      ctx.fill();
    });
  });
};
