import { deployments } from '@pob/protocol';
import {
  TokenMetadata,
  PRINT_DRAW_SETTINGS,
  sketchFactoryRaw,
} from '@pob/sketches';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { STARTING_INDEX } from '../constants/parameters';
import { fetcher } from '../utils/fetcher';
import { GIFT_TOKEN_ID_VALID } from '../utils/regex';

type MetadataTrait = { trait_type: string; value: string | number };

const getIPFSMetadataIndex = (tokenID: number) => tokenID + STARTING_INDEX;

const getTokenMetadata = (tokenID: number): TokenMetadata | undefined => {
  const valid = GIFT_TOKEN_ID_VALID(tokenID);
  const metadataIndex = getIPFSMetadataIndex(tokenID);
  const { data } = useSWR(
    valid
      ? `https://ipfs.io/ipfs/${deployments[1].baseTokenURI}/${metadataIndex}`
      : ``,
    fetcher,
  );
  const filter = useCallback(
    (trait: string) =>
      data?.attributes?.find(
        (attribute: MetadataTrait) => attribute?.trait_type === trait,
      )?.value,
    [data],
  );

  return useMemo(
    () =>
      valid && data
        ? ({
            seed: filter('seed'),
            tileSet: filter('tileSet'),
            framed: filter('framed'),
            composition: filter('composition'),
            rarity: filter('rarity'),
            complexity: filter('complexity'),
          } as TokenMetadata)
        : undefined,
    [valid, data, filter],
  );
};

export const useCanvas = (
  tokenID: number,
  canvasRef: React.RefObject<HTMLCanvasElement>,
) => {
  const [canvasImgData, setCanvasImgData] = useState('');
  const metadata = getTokenMetadata(tokenID);

  useEffect(() => {
    (async () => {
      if (metadata && canvasRef.current) {
        const factory = sketchFactoryRaw(metadata, PRINT_DRAW_SETTINGS);
        await factory(canvasRef.current);
        if (process.browser) {
          setCanvasImgData(canvasRef.current.toDataURL('image/png'));
        }
      }
    })();
  }, [metadata, canvasRef.current, process.browser]);

  return {
    canvasImgData,
  };
};
