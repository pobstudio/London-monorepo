import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { PFP } from '../components/pfp';
import { HASH_CONTRACT, LONDON_GIFT_CONTRACT } from '../constants';
export const SELECTABLE_BACKGROUND: [string, string][] = [
  [LONDON_GIFT_CONTRACT, 'LONDON gift'],
  [HASH_CONTRACT, '$HASH'],
];

export const PER_PROJECT_SETTINGS: { [key: string]: any } = {
  '0x031920cc2d9f5c10b444fd44009cd64f829e7be2': {
    thresholds: [0.01, 0.3, 0.3],
  },
};

const IndexPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>LONDON Gift</Bold> background change service
        </Title>
        <Caption>
          <Italic>Complementary service for all avatars + LONDON gifts!</Italic>
        </Caption>
        <PFP />
      </PageWrapper>
    </>
  );
};

export default React.memo(IndexPage);

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 14px;
  flex-direction: column;
  padding-top: 128px;
  > p + p {
    margin-top: 20px;
  }
`;
