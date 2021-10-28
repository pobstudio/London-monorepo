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
<svg width="600" height="600" viewBox="0 0 600 600"><rect x="0" y="0" width="100%" height="100%"/><path fill="white" d="M 60.0000 25.0000 m 0 138.2794 l 239.5000 -138.2794 l 239.5000 138.2794 l 0 273.4412 l -239.5000 138.2794 l -239.5000 -138.2794"/><path fill="#49ff00" d="M 60.0000 231.2500 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#49ff00" d="M 179.7500 231.2500 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#49ff00" d="M 179.7500 437.5000 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#fbff00" d="M 59.8750 34.5980 m 0 17.2849 l 29.9375 -17.2849 l 29.9375 17.2849 l 0 34.1802 l -29.9375 17.2849 l -29.9375 -17.2849"/><path fill="#49ff00" d="M 149.6875 34.5980 m 0 17.2849 l 29.9375 -17.2849 l 29.9375 17.2849 l 0 34.1802 l -29.9375 17.2849 l -29.9375 -17.2849"/><path fill="#49ff00" d="M 149.6875 137.7230 m 0 17.2849 l 29.9375 -17.2849 l 29.9375 17.2849 l 0 34.1802 l -29.9375 17.2849 l -29.9375 -17.2849"/><path fill="#ff9300" d="M 29.9374 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#49ff00" d="M 44.9061 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#49ff00" d="M 29.9374 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#ff9300" d="M 59.8749 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#ff9300" d="M 14.9687 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#ff0000" d="M 59.8749 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#ff9300" d="M 89.8124 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#fbff00" d="M 119.7499 17.3133 m 0 8.6424 l 14.9687 -8.6424 l 14.9687 8.6424 l 0 17.0902 l -14.9687 8.6424 l -14.9687 -8.6424"/><path fill="#ff0000" d="M 11.2264 6.5035 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff9300" d="M 26.1951 6.5035 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#fbff00" d="M 26.1951 6.5035 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 11.2264 12.9852 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff9300" d="M 3.7421 12.9852 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#fbff00" d="M 3.7421 12.9852 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff9300" d="M 26.1951 12.9852 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 26.1951 12.9852 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 26.1951 38.7664 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#fbff00" d="M 26.1951 38.7664 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 26.1951 47.3601 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#fbff00" d="M 11.2264 47.3601 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff9300" d="M 11.2264 21.5789 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#49ff00" d="M 11.2264 21.5789 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#fbff00" d="M 11.2264 21.5789 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 14.9686 30.2212 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 14.9686 4.4400 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/><path fill="#ff0000" d="M 37.4216 4.4400 m 0 4.3211 l 7.4843 -4.3211 l 7.4843 4.3211 l 0 8.5453 l -7.4843 4.3211 l -7.4843 -4.3211"/></svg>      </PageWrapper>
    </>
  );
};

export default React.memo(TestPage);
