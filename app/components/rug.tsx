import { useCallback, useMemo, useState } from 'react';
import { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { keyOutColorToAlpha } from '../utils/chromaKey';
import { getImage, getMostUsedColors, getImageData } from '../utils/image';
import { Flex, FlexCenterColumn, FlexEnds } from './flex';

const Canvas = styled.canvas`
  width: 100%;
  /* height: 400px; */
  display: block;
`;

const HiddenCanvas = styled.canvas`
  width: 0;
  height: 0;
  display: block;
`;

const Button = styled.button`
  border: none;
  background: none;
  color: black;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  text-decoration: underline;
  svg {
    margin-right: 12px;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :hover {
    background: #f6f6f6;
  }
`;

const ControlsRow = styled(FlexEnds)`
  border-bottom: 1px solid black;
  width: 100%;
  background: none;
`;

export const RUG_PIXEL_WIDTH = 2000;
export const RUG_PIXEL_HEIGHT = 1000;

const PROFILE_PIXEL_WIDTH = 500;
const PROFILE_PIXEL_HEIGHT = 500;

const CanvasWrapper = styled(FlexCenterColumn)`
  background: white;
`;

const CanvasContentWrapper = styled(FlexCenterColumn)`
  flex-grow: 1;
  justify-content: center;
  border-bottom: 1px solid black;
`;

export type RugImgSrcs = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];
export type RugImgRotations = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];
export type RugImgScales = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

const FRAME_CUT_OFF = 32;

export const RugCanvas: FC<{
  rugImgSrcs?: RugImgSrcs;
}> = ({ rugImgSrcs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const [tick, setTick] = useState(0);

  const [rotation, setRotation] = useState(0);

  const rugImgRotations = useMemo(() => {
    return [
      rotation,
      rotation,
      rotation,
      rotation,
      rotation,
      rotation,
      rotation,
      rotation,
    ] as RugImgRotations;
  }, [rotation]);

  const rugImgScales = useMemo(() => {
    return [
      [1, 1],
      [-1, 1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
      [1, -1],
      [-1, -1],
    ] as RugImgScales;
  }, []);

  useEffect(() => {
    const processImage = async () => {
      if (!hiddenCanvasRef.current || !canvasRef.current) {
        return;
      }
      const hiddenCtx = hiddenCanvasRef.current.getContext('2d');
      const ctx = canvasRef.current.getContext('2d');
      if (!hiddenCtx || !ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (!rugImgSrcs) {
        ctx.strokeStyle = '#C4C4C4';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(RUG_PIXEL_WIDTH, RUG_PIXEL_HEIGHT);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, RUG_PIXEL_HEIGHT);
        ctx.lineTo(RUG_PIXEL_WIDTH, 0);
        ctx.stroke();
        setTick((t) => t + 1);
        return;
      }

      for (let i = 0; i < 8; ++i) {
        const image = await getImage(rugImgSrcs[i]);
        const rotation = rugImgRotations?.[i] ?? 0;
        ctx.save();
        const [x, y] = [
          PROFILE_PIXEL_WIDTH * (i % 4),
          PROFILE_PIXEL_HEIGHT * Math.floor(i / 4),
        ];
        ctx.translate(
          x + PROFILE_PIXEL_WIDTH / 2,
          y + PROFILE_PIXEL_HEIGHT / 2,
        );
        ctx.scale(...rugImgScales[i]);
        ctx.rotate(rotation);
        ctx.drawImage(
          image,
          FRAME_CUT_OFF,
          FRAME_CUT_OFF,
          image.height - FRAME_CUT_OFF * 2,
          image.width - FRAME_CUT_OFF * 2,
          PROFILE_PIXEL_WIDTH / -2,
          PROFILE_PIXEL_WIDTH / -2,
          PROFILE_PIXEL_WIDTH,
          PROFILE_PIXEL_HEIGHT,
        );
        ctx.restore();
      }
      setTick((t) => t + 1);
    };

    processImage();
  }, [canvasRef, hiddenCanvasRef, rugImgSrcs, rugImgRotations, rugImgScales]);

  const imageHref = useMemo(() => {
    if (!canvasRef.current) {
      return undefined;
    }
    return canvasRef.current.toDataURL('image/png');
  }, [canvasRef, tick]);

  // const isDownloadButtonDisabled = useMemo(() => !imageHref, [imageHref]);

  return (
    <CanvasWrapper>
      <ControlsRow>
        <Button
          style={{ borderRight: '1px solid black' }}
          disabled={!rugImgSrcs}
          onClick={() => setRotation((s) => s + Math.PI * 0.5)}
        >
          Rotate
        </Button>
        <Button
          style={{ borderLeft: '1px solid black' }}
          as={'a'}
          href={imageHref}
          download={'banner.png'}
        >
          Download
        </Button>
      </ControlsRow>
      <CanvasContentWrapper>
        <HiddenCanvas ref={hiddenCanvasRef} />
        <Canvas
          width={RUG_PIXEL_WIDTH}
          height={RUG_PIXEL_HEIGHT}
          ref={canvasRef}
        />
      </CanvasContentWrapper>
    </CanvasWrapper>
  );
};
