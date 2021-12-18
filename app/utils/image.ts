import { lowerCaseCheck } from './format';

export const getImageData = async (canvas: HTMLCanvasElement, src: string) => {
  const isSVG = lowerCaseCheck(src, '.svg');
  const imageData = new Promise<ImageData>((res) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 600;
      canvas.height = 600;
      ctx.drawImage(
        img,
        0,
        0,
        isSVG ? canvas.width : img.width,
        isSVG ? canvas.height : img.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      res(imageData);
    };
    img.crossOrigin = 'Anonymous';
    img.src = src;
  });
  return await imageData;
};

export const getImage = async (src: string) => {
  const imageData = new Promise<HTMLImageElement>((res) => {
    const img = new Image();
    img.onload = () => {
      res(img);
    };
    img.crossOrigin = 'Anonymous';
    img.src = src;
  });
  return await imageData;
};

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export const getMostUsedColors = (imageData: ImageData, ct: number = 1) => {
  const colorsMap: { [hexStr: string]: number } = {};

  let pxs = imageData.data;
  for (let p = 0; p < pxs.length; p += 4) {
    const hexStr = rgbToHex(pxs[p], pxs[p + 1], pxs[p + 2]);
    if (!colorsMap[hexStr]) {
      colorsMap[hexStr] = 0;
    }
    colorsMap[hexStr]++;
  }

  return Object.entries(colorsMap)
    .sort((a, b) => b[1] - a[1])
    .map((a) => a[0])
    .slice(0, ct);
};
