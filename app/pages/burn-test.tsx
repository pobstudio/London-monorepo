import React, { FC } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { BellCurve } from '../components/bellCurve';
import { Countdown } from '../components/countdown';
import {
  Text,
  Bold,
  MiniText,
  SubTitle,
  Italic,
  RightAlignedText,
  Title,
  Caption,
} from '../components/text';
import { A } from '../components/anchor';
import {
  CHAIN_ID,
  DUNE_DASHBOARD_LINK,
  LONDON_DAO_TITLE,
  NOTION_WIKI_LINK,
  OPENSEA_ASSET_NAME,
  SNAPSHOT_LINK,
  STUDIO_PROD_LINK,
  TOKEN_SYMBOL,
} from '../constants';
import {
  BLOCK_NUMBER_UNLOCK_START_AT,
  MAX_MINT_NOT_UNLOCKED,
  MAX_MINT_PER_TX,
  MAX_SUPPLY,
} from '../constants/parameters';
import { Header } from '../components/header';
import { NAMES_RARITY_MAP, RARITY, RARITY_TILE_MAP } from '@pob/sketches';
import {
  TableBody,
  TableColumn,
  TableContainer,
  TableHeader,
  TableRow,
} from '../components/table';
import { BREAKPTS } from '../styles';
import { useShopState } from '../hooks/useShopState';
import {
  getEtherscanAddressUrl,
  getOpenSeaAssetUrl,
  getOpenSeaCollectionUrl,
} from '../utils/urls';
import { deployments } from '@pob/protocol';
import { FlexCenter } from '../components/flex';
import { POBIcon } from '../components/icons/pob';
import { MintGift } from '../components/mintGift';
import { ROUTES } from '../constants/routes';
import Link from 'next/link';

// import { ContentWrapper } from '../components/content';
// import { Header } from '../components/header';
// import { Footer } from '../components/footer';
// import { BREAKPTS } from '../styles';
// import { YourSagaSection } from '../components/saga-hero-section';
// import { HashInfoSection } from '../components/hash-info-section';
// import { SagaPricingSection } from '../components/saga-pricing-section';
// import { HeroContent } from '../components/home-hero';

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 14px;
  flex-direction: column;
  padding-top: 240px;
  > p + p {
    margin-top: 20px;
  }
`;

const SQRT_3 = 1.73205080757;

const getXForThirtyAngle = (y: number) => y / SQRT_3;
const getYForThirtyAngle = (x: number) => x * SQRT_3;

const TestPage: NextPage = () => {
  const shopState = useShopState();

  return (
    <>
      <Header />
      <PageWrapper>
        <svg width="600" height="600" viewBox="0 0 600 600">
          <rect
            opacity="0.5"
            fill="#ffbf86"
            x="0"
            y="0"
            width="100%"
            height="100%"
          />
          <path
            d=" M 40 40 l 0 0 M 80 40 l 80 0 M 200 40 l 200 0 M 440 40 l 120 0 M 40 80 l 200 0 M 280 80 l 0 0 M 320 80 l 160 0 M 520 80 l 40 0 M 40 120 l 120 0 M 200 120 l 120 0 M 360 120 l 0 0 M 400 120 l 0 0 M 440 120 l 0 0 M 480 120 l 80 0 M 40 160 l 0 0 M 80 160 l 200 0 M 320 160 l 240 0 M 40 200 l 160 0 M 240 200 l 200 0 M 480 200 l 80 0 M 40 240 l 0 0 M 80 240 l 40 0 M 160 240 l 200 0 M 400 240 l 0 0 M 440 240 l 80 0 M 560 240 l 0 0 M 40 280 l 80 0 M 160 280 l 80 0 M 280 280 l 80 0 M 400 280 l 160 0 M 40 320 l 120 0 M 200 320 l 120 0 M 360 320 l 200 0 M 40 360 l 240 0 M 320 360 l 240 0 M 40 400 l 40 0 M 120 400 l 40 0 M 200 400 l 200 0 M 440 400 l 120 0 M 40 440 l 240 0 M 320 440 l 160 0 M 520 440 l 40 0 M 40 480 l 40 0 M 120 480 l 80 0 M 240 480 l 240 0 M 520 480 l 40 0 M 40 520 l 40 0 M 120 520 l 160 0 M 320 520 l 120 0 M 480 520 l 80 0 M 40 560 l 200 0 M 280 560 l 40 0 M 360 560 l 40 0 M 440 560 l 40 0 M 520 560 l 40 0"
            stroke-width="12"
            opacity="0.75"
            stroke="#ffbf86"
            stroke-linecap="round"
          />
          <path
            d=" M 40 40 l 200 0 M 40 160 l 0 120 M 40 280 l 0 0 M 40 360 l 0 200 M 40 520 l 0 0 M 80 40 l 0 0 M 80 440 l 0 0 M 120 120 l 240 0 M 120 200 l 0 120 M 120 320 l 0 0 M 120 480 l 0 0 M 160 80 l 0 0 M 160 120 l 0 0 M 160 160 l 0 0 M 160 200 l 0 0 M 160 240 l 0 0 M 160 280 l 0 0 M 160 320 l 0 0 M 160 360 l 0 0 M 160 400 l 0 0 M 160 440 l 0 0 M 160 480 l 0 0 M 160 520 l 0 0 M 200 280 l 280 280 M 240 40 l 120 0 M 240 240 l 160 160 M 240 440 l 0 80 M 240 480 l 0 80 M 280 40 l 0 120 M 280 200 l 0 0 M 280 400 l 160 160 M 320 40 l 120 0 M 320 120 l 0 0 M 320 240 l 0 0 M 320 280 l 0 0 M 320 320 l 0 0 M 320 360 l 0 0 M 320 400 l 0 0 M 320 440 l 0 0 M 320 480 l 0 0 M 320 520 l 0 0 M 360 160 l 0 240 M 360 200 l 0 0 M 360 400 l 80 0 M 400 160 l 0 200 M 400 240 l 0 0 M 400 280 l 0 0 M 440 120 l 120 120 M 440 280 l 0 0 M 440 360 l 0 0 M 440 440 l 120 120 M 480 240 l 0 0 M 480 280 l 0 0 M 480 320 l 0 0 M 480 360 l 0 0 M 480 400 l 0 0 M 480 440 l 0 0 M 480 480 l 0 0 M 480 520 l 0 0 M 520 40 l 40 0 M 520 80 l 40 0 M 520 280 l 0 120 M 520 440 l 0 0 M 520 520 l 0 0"
            stroke-width="12"
            opacity="0.75"
            stroke="#cee5d0"
            stroke-linecap="round"
          />
          <path
            d=" M 40 40 l 200 0 M 40 160 l 0 120 M 40 280 l 0 0 M 40 360 l 0 200 M 40 520 l 0 0 M 80 40 l 0 0 M 120 200 l 240 0 M 120 480 l 0 0 M 160 400 l 0 0 M 160 440 l 0 0 M 160 480 l 0 0 M 160 520 l 0 0 M 200 280 l 280 280 M 240 40 l 120 0 M 240 240 l 160 160 M 280 200 l 0 120 M 280 360 l 0 0 M 320 280 l 120 0 M 320 360 l 0 0 M 320 480 l 0 0 M 320 520 l 0 0 M 360 160 l 0 240 M 360 240 l 200 200 M 400 240 l 0 200 M 400 360 l 40 0 M 400 400 l 160 160 M 440 200 l 120 120 M 440 360 l 0 0 M 480 80 l 80 80 M 480 400 l 0 0 M 480 440 l 0 0 M 480 480 l 0 0 M 480 520 l 0 0 M 520 160 l 40 0 M 520 360 l 0 120 M 520 520 l 0 0"
            stroke-width="12"
            opacity="0.75"
            stroke="#f3f0d7"
            stroke-linecap="round"
          />
          <path
            d=" M 40 40 l 200 0 M 40 160 l 0 120 M 40 280 l 0 0 M 40 360 l 0 200 M 40 520 l 0 0 M 80 40 l 0 0 M 200 280 l 280 280 M 280 360 l 0 120 M 280 520 l 0 0 M 320 440 l 120 0 M 320 520 l 0 0 M 360 120 l 0 0 M 360 160 l 0 0 M 360 200 l 0 0 M 360 240 l 0 0 M 360 280 l 0 0 M 360 320 l 0 0 M 360 360 l 0 0 M 360 400 l 0 0 M 360 440 l 0 0 M 360 480 l 0 0 M 360 520 l 0 0 M 400 40 l 0 0 M 400 200 l 120 0 M 440 80 l 120 120 M 440 320 l 0 160 M 480 40 l 0 0 M 480 320 l 0 0 M 480 360 l 40 40 M 480 440 l 80 0 M 480 520 l 40 40 M 520 280 l 0 0 M 520 320 l 0 0 M 520 360 l 0 0 M 520 400 l 0 0 M 520 440 l 0 0 M 520 480 l 0 0 M 520 520 l 0 0"
            stroke-width="12"
            opacity="0.75"
            stroke="#fed2aa"
            stroke-linecap="round"
          />
        </svg>{' '}
      </PageWrapper>
    </>
  );
};

export default React.memo(TestPage);
