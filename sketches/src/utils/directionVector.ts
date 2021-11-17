import { Cord, Vec2 } from '..';

export const getDirectionVector = (directionIndex: number): Cord => {
  if (directionIndex == 0) {
    return [-1, -1];
  }
  if (directionIndex == 1) {
    return [-1, 0];
  }
  if (directionIndex == 2) {
    return [-1, 1];
  }
  if (directionIndex == 3) {
    return [0, -1];
  }
  if (directionIndex == 4) {
    return [0, 1];
  }
  if (directionIndex == 5) {
    return [1, 1];
  }
  if (directionIndex == 6) {
    return [1, 0];
  }
  if (directionIndex == 7) {
    return [1, -1];
  }
  return [0, 0];
};

export const getDirectionVectorFromAngle = (angle: number): Cord => {
  if (angle == 0) {
    return [0, -1];
  }
  if (angle == 45) {
    return [1, -1];
  }
  if (angle == 90) {
    return [1, 0];
  }
  if (angle == 135) {
    return [1, 1];
  }
  if (angle == 180) {
    return [0, 1];
  }
  if (angle == 225) {
    return [-1, 1];
  }
  if (angle == 270) {
    return [-1, 0];
  }
  if (angle == 315) {
    return [-1, -1];
  }
  return [0, 0];
};

export const getOppositeIndexFromDirectionIndex = (index: number) => {
  if (index === 0) {
    return 5;
  }
  if (index === 1) {
    return 6;
  }
  if (index === 7) {
    return 2;
  }
  if (index === 3) {
    return 4;
  }
  if (index === 4) {
    return 3;
  }
  if (index === 5) {
    return 0;
  }
  if (index === 6) {
    return 1;
  }
  if (index === 7) {
    return 2;
  }
  return -1;
};

export const getDirectionIndexFromVector = (v: Vec2) => {
  if (v[0] < 0 && v[1] === v[0]) {
    return 0;
  }
  if (v[0] < 0 && v[1] === 0) {
    return 1;
  }
  if (v[0] < 0 && Math.abs(v[1]) === Math.abs(v[0])) {
    return 2;
  }
  if (v[0] === 0 && v[1] < 0) {
    return 3;
  }
  if (v[0] === 0 && v[1] > 0) {
    return 4;
  }
  if (v[0] > 0 && v[1] === v[0]) {
    return 5;
  }
  if (v[0] > 0 && v[1] === 0) {
    return 6;
  }
  if (v[0] > 0 && Math.abs(v[1]) === Math.abs(v[0])) {
    return 7;
  }
  return -1;
};
