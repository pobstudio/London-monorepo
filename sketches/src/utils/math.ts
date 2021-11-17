import { Vec2 } from '../types';

export const addVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] + v2[0],
  v1[1] + v2[1],
];

export const subVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] - v2[0],
  v1[1] - v2[1],
];

export const mulVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] * v2[0],
  v1[1] * v2[1],
];

export const divVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] / v2[0],
  v1[1] / v2[1],
];

export const modVec2 = (v1: Vec2, v2: Vec2): Vec2 => [
  v1[0] % v2[0],
  v1[1] % v2[1],
];

export const divVec2ByVal = (v1: Vec2, n: number): Vec2 => [
  v1[0] / n,
  v1[1] / n,
];

export const dotMulVec2 = (v1: Vec2, v2: Vec2) => v1[0] * v2[0] + v1[1] * v2[1];

export const lenVec2 = (v: Vec2) =>
  v[0] === 0 && v[1] === 0 ? 0 : (v[0] ** 2 + v[1] ** 2) ** 0.5;

export const normVec2 = (v: Vec2) =>
  v[0] === 0 && v[1] === 0 ? [0, 0] : divVec2ByVal(v, lenVec2(v));

export const applyVec2 = (
  v: Vec2,
  t: [(n: number) => number, (n: number) => number],
): Vec2 => [t[0](v[0]), t[1](v[1])];

export const getPermutations = (inputArr: any[]) => {
  let result: any[] = [];

  const permute = (arr: any[], m: any[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(inputArr);

  return result;
};

export const lerp = (v0: number, v1: number, t: number) => {
  return v0 * (1 - t) + v1 * t;
};
