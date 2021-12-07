import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CHAIN_ID,
  EMBERS_OPENSEA_ASSET_NAME,
  LONDON_EMOJI,
  LONDON_PROD_LINK,
  NULL_ADDRESS,
  ONE_GWEI,
  OPENSEA_ASSET_NAME,
  TOKEN_SYMBOL,
  TWITTER_LINK,
} from '../../constants';
import { useMinter } from '../../hooks/useMinter';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { Flex, FlexCenter, FlexCenterColumn, FlexEnds } from '../flex';
import { ASpan, Bold, Italic, Text, Title } from '../text';
import { useBlockchainStore } from '../../stores/blockchain';
import { useGasInfo } from '../../hooks/useGasInfo';
import { getTwitterShareLink } from '../../utils/twitter';
import { BREAKPTS } from '../../styles';
import { useShopState } from '../../hooks/useShopState';
import {
  getIPFSUrl,
  getOpenSeaAssetUrl,
  getOpenSeaCollectionUrl,
  getOpenSeaUserAssetUrl,
} from '../../utils/urls';
import { deployments } from '@pob/protocol';
import {
  OPENSEA_ASSET,
  OPENSEA_COLLECTION,
  useLondonAssets,
} from '../../hooks/useOpenSea';
import { useRef } from 'react';
import { useNFTContract } from '../../hooks/useContracts';
import { computeEmbers, DIMENSION, FRAME_DURATION } from '@pob/sketches';
import { getImage } from '../../utils/image';
import GIF from 'gif.js';

const Wrapper = styled.div`
  border: 1px solid black;
  background: white;
  width: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
    width: 350px;
  }
  position: relative;
`;

const HiddenCanvas = styled.canvas`
  width: 0;
  height: 0;
  display: block;
`;

const Body = styled.div`
  padding: 14px;
`;

export const GifEmbers: FC = () => {
  const { account } = useWeb3React();
  const embers = useNFTContract(deployments[CHAIN_ID].embers);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const londonAssets = useLondonAssets(account ?? NULL_ADDRESS);
  const selectedCollection = useMemo(() => {
    return londonAssets.find(
      (i) => i.contract === deployments[CHAIN_ID].embers,
    );
  }, [londonAssets]);

  const assets = useMemo(
    () => selectedCollection?.assets,
    [selectedCollection],
  );

  const handleClick = useCallback(async (tokenId: string) => {
    if (!hiddenCanvasRef.current) {
      return;
    }
    const hiddenCanvas = hiddenCanvasRef.current;
    const hiddenCtx = hiddenCanvasRef.current.getContext('2d');
    hiddenCanvas.width = DIMENSION;
    hiddenCanvas.height = DIMENSION;
    if (!hiddenCtx) {
      return;
    }
    if (!embers) {
      return;
    }
    const uri = await embers.tokenURI(tokenId);
    if (!uri.startsWith('ipfs://')) {
      return;
    }
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
      width: DIMENSION,
      height: DIMENSION,
    });
    for (let i = 0; i < metadata.gene.frameCt; ++i) {
      const svg = renderSvgAtFrame(i);
      const img = await getImage(`data:image/svg+xml;base64,${btoa(svg)}`);
      // hiddenCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
      gif.addFrame(img, { delay: FRAME_DURATION * 1000 });
    }
    gif.on('finished', (blob: any) => {
      window.open(URL.createObjectURL(blob));
    });
    
    gif.render();
  }, [embers, hiddenCanvasRef]);

  return (<>
    <HiddenCanvas ref={hiddenCanvasRef} />
    <Wrapper>
      <Body>
        <FlexEnds>
          <Text>
            <Italic>Click to download gif: </Italic>
          </Text>
        </FlexEnds>
        {!assets || assets.length === 0 || !selectedCollection ? (
          <EmptyCollectionContainer>
            <Text style={{ opacity: 0.5 }}>Do not own any.</Text>
          </EmptyCollectionContainer>
        ) : (
          <CollectionBody>
            {assets.map((asset: OPENSEA_ASSET) => (
              <Asset
                as={'a'}
                key={`asset-${asset.name}`}
                onClick={() => handleClick(asset.id)}
              >
                <img src={asset.image} />
              </Asset>
            ))}
          </CollectionBody>
        )}
        <Text style={{ marginTop: 14 }}>Will take a few seconds to load</Text>
      </Body>
    </Wrapper>
    </>
  );
};

const UserSectionContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

const CollectionBody = styled.div<{ isVerticalScroll?: boolean }>`
  display: grid;
  padding: 14px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 14px;
  overflow: auto;
  margin: 0;
  margin-top: 14px;
  max-height: 360px;
  background: #f6f6f6;
`;

const EmptyCollectionContainer = styled(FlexCenter)`
  background: #f6f6f6;
  height: 360px;
  width: 100%;
  margin-top: 14px;
`;

const Asset = styled.div<{ isSelected?: boolean }>`
  box-sizing: border-box;
  border: ${(p) => (p.isSelected ? '8px solid black' : 'none')};
  background: white;
  img {
    display: block;
    height: 100%;
    width: 100%;
  }
`;
