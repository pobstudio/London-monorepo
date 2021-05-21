export function newArray(n: number, value?: any) {
  n = n || 0;
  var array = new Array(n);
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
}

export function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t;
}

export const labelValueWithRanges = (
  rangeStops: number[],
  labels: string[],
  value: number,
) => {
  let index = 0;
  for (let i = 0; i < rangeStops.length; ++i) {
    if (value >= rangeStops[i]) {
      index = i;
    }
  }
  return labels[index];
};

export const getCyclicIndex = (index: number, length: number) => {
  return index % length >= 0 ? index % length : length + (index % length);
};
