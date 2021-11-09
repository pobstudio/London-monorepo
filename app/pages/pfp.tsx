import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Text, Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { AvatarCanvas } from '../components/avatar';
import { useWeb3React } from '@web3-react/core';
import { WalletState, Web3Status } from '../components/web3Status';
import { PFP } from '../components/pfp';
import {
  OPENSEA_ASSET,
  OPENSEA_COLLECTION,
  useOtherAssets,
  usePobAssets,
} from '../hooks/useOpenSea';
import { BREAKPTS } from '../styles';
import {
  Flex,
  FlexCenter,
  FlexCenterColumn,
  FlexEnds,
} from '../components/flex';
import { HASH_CONTRACT, LONDON_GIFT_CONTRACT } from '../constants';
import { A, AButton } from '../components/anchor';
import { getOpenSeaAssetUrl } from '../utils/urls';
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
