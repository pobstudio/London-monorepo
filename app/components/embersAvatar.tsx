import { deployments } from '@pob/protocol';
import { computeEmbers, DIMENSION, FRAME_DURATION } from '@pob/sketches';
import { useCallback, useMemo, useState } from 'react';
import { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { CHAIN_ID } from '../constants';
import { useNFTContract } from '../hooks/useContracts';
import { keyOutColorToAlpha } from '../utils/chromaKey';
import { getImage, getMostUsedColors, getImageData } from '../utils/image';
import { getIPFSUrl } from '../utils/urls';
import { FlexCenterColumn } from './flex';
import GIF from 'gif.js';

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
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  width: 100%;
  background: none;
  color: black;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px;
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

const DEFAULT_HUE_THRESHOLD = 10;
const DEFAULT_SAT_THRESHOLD = 10;
const DEFAULT_VAL_THRESHOLD = 10;

const DEFAULT_THRESHOLDS: [number, number, number] = [
  DEFAULT_HUE_THRESHOLD,
  DEFAULT_SAT_THRESHOLD,
  DEFAULT_VAL_THRESHOLD,
];

export const PROFILE_PIXEL_WIDTH = 600;
export const PROFILE_PIXEL_HEIGHT = 600;

const CanvasWrapper = styled(FlexCenterColumn)`
  background: white;
`;

const CanvasContentWrapper = styled(FlexCenterColumn)`
  flex-grow: 1;
  justify-content: center;
`;

export const EmbersAvatarCanvas: FC<{
  backgroundEmbersTokenId?: string;
  foregroundImageSrc?: string;
  chromaKeyColor?: string;
  thresholds?: [number, number, number];
}> = ({
  thresholds,
  backgroundEmbersTokenId,
  foregroundImageSrc,
  chromaKeyColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const embers = useNFTContract(deployments[CHAIN_ID].embers);
  const [tick, setTick] = useState(0);

  const [imageHref, setImageHref] = useState<string | undefined>(undefined);

  useEffect(() => {
    const processImage = async () => {
      if (!hiddenCanvasRef.current || !canvasRef.current) {
        return;
      }
      if (!embers) {
        return;
      }
      if (!backgroundEmbersTokenId) {
        return;
      }
      const hiddenCtx = hiddenCanvasRef.current.getContext('2d');
      const ctx = canvasRef.current.getContext('2d');
      hiddenCanvasRef.current.width = PROFILE_PIXEL_WIDTH;
      hiddenCanvasRef.current.height = PROFILE_PIXEL_HEIGHT;
      if (!hiddenCtx || !ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (!foregroundImageSrc) {
        ctx.strokeStyle = '#C4C4C4';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(PROFILE_PIXEL_WIDTH, PROFILE_PIXEL_HEIGHT);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, PROFILE_PIXEL_HEIGHT);
        ctx.lineTo(PROFILE_PIXEL_WIDTH, 0);
        ctx.stroke();
      }
      const uri = await embers.tokenURI(backgroundEmbersTokenId);
      const url = getIPFSUrl(uri.slice(7));
      const fetchRes = await fetch(url);
      const metadata = await fetchRes.json();
      if (!metadata.gene) {
        return;
      }
      const { renderSvgAtFrame } = computeEmbers(metadata.gene);
      const gif = new GIF({
        workers: 2,
        quality: 10,
        repeat: 0,
        width: PROFILE_PIXEL_WIDTH,
        height: PROFILE_PIXEL_HEIGHT,
      });

      let foregroundBitMap: ImageBitmap | undefined = undefined;
      if (!!foregroundImageSrc) {
        const foregroundImageData = await getImageData(
          hiddenCanvasRef.current,
          foregroundImageSrc,
        );
        const usedColors = getMostUsedColors(foregroundImageData);
        const finalThresholds: [number, number, number] =
          thresholds ?? DEFAULT_THRESHOLDS;
        const keyedOutForegroundImageData = keyOutColorToAlpha(
          foregroundImageData,
          usedColors[0],
          ...finalThresholds,
        );
        foregroundBitMap = await createImageBitmap(keyedOutForegroundImageData);
      }

      for (let i = 0; i < metadata.gene.frameCt; ++i) {
        const svg = renderSvgAtFrame(i);
        const img = await getImage(`data:image/svg+xml;base64,${btoa(svg)}`);
        hiddenCtx.clearRect(
          0,
          0,
          hiddenCanvasRef.current.width,
          hiddenCanvasRef.current.height,
        );

        hiddenCtx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          hiddenCanvasRef.current.width,
          hiddenCanvasRef.current.height,
        );

        if (!!foregroundBitMap) {
          hiddenCtx.drawImage(
            foregroundBitMap,
            0,
            0,
            foregroundBitMap.width,
            foregroundBitMap.height,
            0,
            0,
            hiddenCanvasRef.current.width,
            hiddenCanvasRef.current.height,
          );
        }

        gif.addFrame(hiddenCtx, { delay: FRAME_DURATION * 1000, copy: true });
      }
      gif.on('finished', async (blob: any) => {
        if (!canvasRef.current) {
          return;
        }
        const svg = renderSvgAtFrame(0);
        const img = await getImage(`data:image/svg+xml;base64,${btoa(svg)}`);
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );

        // window.open(URL.createObjectURL(blob));
        setImageHref(URL.createObjectURL(blob));
        if (!!foregroundBitMap) {
          ctx.drawImage(
            foregroundBitMap,
            0,
            0,
            foregroundBitMap.width,
            foregroundBitMap.height,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
        }
      });

      gif.render();

      setTick((t) => t + 1);
    };
    processImage();
  }, [
    canvasRef,
    embers,
    hiddenCanvasRef,
    backgroundEmbersTokenId,
    foregroundImageSrc,
    chromaKeyColor,
    thresholds,
  ]);

  const isDownloadButtonDisabled = useMemo(() => !imageHref, [imageHref]);

  return (
    <CanvasWrapper>
      <CanvasContentWrapper>
        <HiddenCanvas ref={hiddenCanvasRef} />
        <Canvas
          width={PROFILE_PIXEL_WIDTH}
          height={PROFILE_PIXEL_HEIGHT}
          ref={canvasRef}
        />
      </CanvasContentWrapper>
      <Button
        style={{ display: 'block' }}
        as={'a'}
        href={imageHref}
        download={'profile.gif'}
      >
        Download
      </Button>
    </CanvasWrapper>
  );
};
