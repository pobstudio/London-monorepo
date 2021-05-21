import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import styled, { keyframes } from 'styled-components';
import { FlexEnds } from '../../components/flex';
import { OG_GRAPH_BANNER } from '@pob/common';

const OpenGraphContainer = styled.div`
  width: ${OG_GRAPH_BANNER[0]}px;
  height: ${OG_GRAPH_BANNER[0]}px;
  position: relative;
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { title, subtitle } = context.query;
  if (!title) {
    return {
      notFound: true,
    };
  }

  return {
    props: { title, subtitle: subtitle ?? '' },
  };
};

const SmallCardForeground = styled.div.attrs({
  className: 'small-card-foreground',
})`
  position: absolute;
  top: 0px;
  right: 0px;
  left: 0px;
  bottom: 0px;
  padding: 64px;
  background: black;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`;

const CollectionTitle = styled.h2`
  margin: 0;
  font-size: 112px;
  color: white;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
`;

const CollectionSubTitle = styled.h4`
  margin: 0;
  font-size: 48px;
  color: white;
  font-weight: 500;
  text-transform: uppercase;
`;

const SigImage = styled.img`
  display: block;
  height: 100px;
`;

const PreviewPage: NextPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { title, subtitle } = props;
  return (
    <OpenGraphContainer>
      <SmallCardForeground>
        <CollectionTitle style={{ flexGrow: 1 }}>{title}</CollectionTitle>
        <FlexEnds style={{ width: '100%', alignItems: 'flex-end' }}>
          <CollectionSubTitle>{subtitle}</CollectionSubTitle>
          <SigImage src={'/POB-SIG-WHITE.svg'} />
        </FlexEnds>
      </SmallCardForeground>
    </OpenGraphContainer>
  );
};

export default React.memo(PreviewPage);
