import { Bound, Cord, Line, Polygon, Rect, RectByCorner } from '../types';
import { addVec2, divVec2, mulVec2 } from './math';

export const getRectCorners = (r: Rect): RectByCorner => {
  return [r[0], [r[1][0], r[0][1]], r[1], [r[0][0], r[1][1]]];
};

export const getRectBounds = (r: Rect): Bound => {
  return [r[1][0] - r[0][0], r[1][1] - r[0][1]];
};

export const getRectArea = (r: Rect): number => {
  const [w, h] = getRectBounds(r);
  return w * h;
};

export const getLinesFromRect = (rect: Rect): Line[] => {
  const r = getRectCorners(rect);
  return [
    [r[0], r[1]],
    [r[1], r[2]],
    [r[2], r[3]],
    [r[3], r[0]],
  ];
};

export const getSlopeFromLine = (l: Line) => {
  const b = getRectBounds(l);
  return b[1] / b[0];
};

export const scaleCord = (cord: Cord, fromRect: Rect, toRect: Rect): Cord => {
  const fromBounds = getRectBounds(fromRect);
  const toBounds = getRectBounds(toRect);
  return addVec2(
    mulVec2(divVec2(getRectBounds([fromRect[0], cord]), fromBounds), toBounds),
    toRect[0],
  );
};

export const getPolygonAsLines = (polygon: Polygon) => {
  const lines: Line[] = [];
  for (let i = 1; i < polygon.length; ++i) {
    lines.push([polygon[i - 1], polygon[i]]);
  }
  lines.push([polygon[0], polygon[polygon.length - 1]]);
  return lines;
};

export const isCordInRect = (c: Cord, r: Rect) => {
  return (
    c[0] >= r[0][0] && c[1] >= r[0][1] && c[0] <= r[1][0] && c[1] <= r[1][1]
  );
};
