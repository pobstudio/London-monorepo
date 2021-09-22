import { deployments } from '@pob/protocol';
import {
  TokenMetadata,
  PRINT_DRAW_SETTINGS,
  sketchFactoryRaw,
} from '@pob/sketches';
import { useMemo, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { STARTING_INDEX } from '../constants/parameters';
import { fetcher } from '../utils/fetcher';
import { GIFT_TOKEN_ID_VALID } from '../utils/regex';

type MetadataTrait = { trait_type: string; value: string | number };

const getIPFSMetadataIndex = (tokenID: number) => tokenID + STARTING_INDEX;

const getTokenMetadata = (tokenID: number): TokenMetadata => {
  const metadataIndex = getIPFSMetadataIndex(tokenID);
  const { data } = useSWR(
    `https://ipfs.io/ipfs/${deployments[1].baseTokenURI}/${metadataIndex}`,
    fetcher,
  );
  const filterWithDefault = (trait: string, defaultVal: string | number) =>
    data?.attributes?.find(
      (attribute: MetadataTrait) => attribute?.trait_type === trait,
    )?.value ?? defaultVal;

  return useMemo(
    () =>
      ({
        seed: filterWithDefault('seed', 5214),
        tileSet: filterWithDefault('tileSet', 'frizzle'),
        framed: filterWithDefault('framed', 'yay'),
        composition: filterWithDefault('composition', 'normal'),
        rarity: filterWithDefault('rarity', 'common'),
        complexity: filterWithDefault('complexity', 'normal'),
      } as TokenMetadata),
    [tokenID, metadataIndex, data],
  );
};

export const useCanvas = (tokenID: number) => {
  const [canvasData, setCanvasData] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metadata = getTokenMetadata(tokenID);

  const Canvas = <canvas ref={canvasRef} />;

  useEffect(() => {
    if (GIFT_TOKEN_ID_VALID(tokenID)) {
      sketchFactoryRaw(metadata, PRINT_DRAW_SETTINGS)(canvasRef.current);
      if (process.browser) {
        setCanvasData(canvasRef?.current?.toDataURL('image/png') ?? '');
      }
    }
  }, [tokenID, metadata, Canvas, canvasRef, process.browser]);

  return {
    Canvas,
    canvasData,
  };
};
