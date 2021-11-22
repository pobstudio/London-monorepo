function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  let rabs,
    gabs,
    babs,
    rr,
    gg,
    bb,
    h: number,
    s,
    v: number,
    diff: any,
    diffc,
    percentRoundFn;
  h = 0;
  rabs = r / 255;
  gabs = g / 255;
  babs = b / 255;
  (v = Math.max(rabs, gabs, babs)), (diff = v - Math.min(rabs, gabs, babs));
  diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
  percentRoundFn = (num: number) => Math.round(num * 100) / 100;
  if (diff == 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(rabs);
    gg = diffc(gabs);
    bb = diffc(babs);

    if (rabs === v) {
      h = bb - gg;
    } else if (gabs === v) {
      h = 1 / 3 + rr - bb;
    } else if (babs === v) {
      h = 2 / 3 + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return [
    Math.round(h * 360),
    percentRoundFn(s * 100),
    percentRoundFn(v * 100),
  ];
}

function hexToRgb(hex: string): [number, number, number] {
  console.log(hex.slice(1));
  var bigint = parseInt(hex.slice(1), 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return [r, g, b];
}

const hexToHsv = (hex: string) => rgbToHsv(...hexToRgb(hex));

const shouldKeyOut =
  (keyHsv: [number, number, number]) =>
  (
    rgb: [number, number, number],
    hueThreshold: number,
    valThreshold: number,
    satThreshold: number,
  ) => {
    const [H, S, V] = rgbToHsv(...rgb);
    // if (!['000', '234217217'].includes(rgb.join(''))) {
    //   console.log(rgb.join(''), Math.abs(keyHsv[0] - H), Math.abs(keyHsv[1] - S), Math.abs(keyHsv[2] - V), hueThreshold, satThreshold, valThreshold)
    // }
    if (Math.abs(keyHsv[0] - H) >= hueThreshold) return false;
    if (Math.abs(keyHsv[1] - S) >= satThreshold) return false;
    if (Math.abs(keyHsv[2] - V) >= valThreshold) return false;
    return true;
  };

export const keyOutColorToAlpha = (
  imageData: ImageData,
  key: string,
  hueThreshold: number,
  valThreshold: number,
  satThreshold: number,
) => {
  let pxs = imageData.data;
  const keyHsv = hexToHsv(key);
  console.log(imageData);
  const p = 100;
  console.log(
    shouldKeyOut(keyHsv)(
      [241, 223, 223],
      hueThreshold,
      valThreshold,
      satThreshold,
    ),
  );

  const keyedValues: string[] = [];

  for (let p = 0; p < pxs.length; p += 4) {
    if (
      shouldKeyOut(keyHsv)(
        [pxs[p], pxs[p + 1], pxs[p + 2]],
        hueThreshold,
        valThreshold,
        satThreshold,
      )
    ) {
      if (!keyedValues.includes([pxs[p], pxs[p + 1], pxs[p + 2]].join(''))) {
        keyedValues.push([pxs[p], pxs[p + 1], pxs[p + 2]].join(''));
      }
      pxs[p + 3] = 0;
    }
  }
  // console.log('keyedValues', keyedValues)
  return imageData;
};
