import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import styled from 'styled-components';
import { getHttpProtocol } from '../../../../utils';
import { Bound } from '../../../../../utils/src';
import { Canvas } from '../../../../sketches/saga/canvas';
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
    }/api/saga/prerender?hash=${hash}`,
  );

  if (result.status === 200) {
    const props = await result.json();
    return {
      props,
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
      dimensions={DIMENSIONS['saga']}
      multiplier={DIMENSIONS_DEFAULT_MULTIPLIER['saga']}
    >
      <Canvas prerenderPayload={payload} />
    </CanvasWrapper>
  );
};

export default React.memo(PreviewPage);
