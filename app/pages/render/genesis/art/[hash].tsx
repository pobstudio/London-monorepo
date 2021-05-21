import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { ContentWrapper, MainContent } from '../../../../components/content';
import styled, { keyframes } from 'styled-components';
import { useRef } from 'react';
import { getHttpProtocol } from '../../../../utils';
import { useMemo } from 'react';
import { Bound } from '../../../../../utils/src';
import { Canvas } from '../../../../sketches/genesis/canvas';
import { useTokenId } from '../../../../hooks/useTokenId';
import { DIMENSIONS, DIMENSIONS_DEFAULT_MULTIPLIER } from '@pob/common';

const CanvasWrapper = styled.div<{ dimensions: Bound; multiplier: number }>`
  position: relative;
  width: ${(p) => p.dimensions[0] * p.multiplier}px;
  height: ${(p) => p.dimensions[1] * p.multiplier}px;
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash } = context.query;

  const result = await fetch(
    `${getHttpProtocol()}://${
      process.env.VERCEL_URL
    }/api/genesis/prerender?hash=${hash}`,
  );

  if (result.status === 200) {
    return {
      props: await result.json(),
    };
  }

  return {
    notFound: true,
  };
};

const PreviewPage: NextPage = (
  payload: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  return (
    <CanvasWrapper
      dimensions={DIMENSIONS['genesis']}
      multiplier={DIMENSIONS_DEFAULT_MULTIPLIER['genesis']}
    >
      <Canvas prerenderPayload={payload} />
    </CanvasWrapper>
  );
};

export default React.memo(PreviewPage);
