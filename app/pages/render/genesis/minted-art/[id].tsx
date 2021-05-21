import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { ContentWrapper, MainContent } from '../../../../components/content';
import styled, { keyframes } from 'styled-components';
import { useRef } from 'react';
import { DIMENSIONS } from '../../../../sketches/genesis';
import { useEffect } from 'react';
import { useState } from 'react';
import { useMountedState } from 'react-use';
import { deployments, HashRegistry__factory } from '@pob/protocol';
import { AlchemyProvider } from '@ethersproject/providers';
import {
  ALCHEMY_KEY,
  CHAIN_ID,
  DRAW_ALCHEMY_KEY,
  ZERO,
} from '../../../../constants';
import { BigNumber } from 'ethers';
import { getHttpProtocol } from '../../../../utils';
import { padHexString } from '../../../../utils/hex';
import { useMemo } from 'react';
import { Bound } from '../../../../../utils/src';
import { DIMENSIONS_DEFAULT_MULTIPLIER } from '@pob/common';
import { Canvas } from '../../../../sketches/genesis/canvas';

const CanvasWrapper = styled.div<{ dimensions: Bound; multiplier: number }>`
  position: relative;
  width: ${(p) => p.dimensions[0] * p.multiplier}px;
  height: ${(p) => p.dimensions[1] * p.multiplier}px;
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, multiplier } = context.query;
  const provider = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);
  const registry = HashRegistry__factory.connect(
    deployments[CHAIN_ID].hashRegistry,
    provider,
  );

  if (!id) {
    return {
      notFound: true,
    };
  }
  let hash = '0x0';

  const h = await registry.tokenIdToTxHash(id as string);

  if (h.eq(ZERO)) {
    return {
      notFound: true,
    };
  } else {
    hash = padHexString(h.toHexString());
  }

  const result = await fetch(
    `${getHttpProtocol()}://${
      process.env.VERCEL_URL
    }/api/genesis/prerender?hash=${hash}`,
  );

  if (result.status === 200) {
    return {
      props: {
        ...(await result.json()),
        tokenId: BigNumber.from(id).toHexString(),
        multiplier: isNaN(parseInt(multiplier as string))
          ? 1
          : parseInt(multiplier as string) / 100,
      },
    };
  }

  return {
    notFound: true,
  };
};

const SignatureImage = styled.img<{ multiplier: number }>`
  position: absolute;
  bottom: 10px;
  right: -10px;
  width: ${(p) => p.multiplier * 320}px;
  z-index: 2;
`;

const PreviewPage: NextPage = (
  payload: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const multiplier = useMemo(() => {
    return payload.multiplier * DIMENSIONS_DEFAULT_MULTIPLIER['genesis'];
  }, [payload.multiplier]);
  return (
    <CanvasWrapper dimensions={DIMENSIONS} multiplier={multiplier}>
      <Canvas prerenderPayload={payload} />
      <SignatureImage src={'/signature.png'} multiplier={multiplier} />
    </CanvasWrapper>
  );
};

export default React.memo(PreviewPage);
