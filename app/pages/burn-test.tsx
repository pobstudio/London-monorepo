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
<svg width="600" height="600" viewBox="0 0 600 600"><rect x="0" y="0" width="100%" height="100%"/><path fill="white" d="M 60.0000 25.0000 m 0 138.2794 l 239.5000 -138.2794 l 239.5000 138.2794 l 0 273.4412 l -239.5000 138.2794 l -239.5000 -138.2794"/><path fill="#49ff00" d="M 119.7500 94.1397 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#49ff00" d="M 239.5000 232.4191 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#49ff00" d="M 239.5000 0.0591 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#fbff00" d="M 59.8750 34.6289 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#49ff00" d="M 0.0350 34.6289 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#49ff00" d="M 0.0350 0.0289 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#ff9300" d="M 239.5000 138.3083 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#49ff00" d="M 0.0000 138.3083 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#49ff00" d="M 0.0000 138.3083 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#ff9300" d="M 0.0200 138.3083 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#ff9300" d="M 119.7500 207.4480 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#ff0000" d="M 0.0000 207.4480 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#ff9300" d="M 239.5000 345.7274 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#fbff00" d="M 0.0300 345.7274 m 0 69.1397 l 119.7500 -69.1397 l 119.7500 69.1397 l 0 136.7206 l -119.7500 69.1397 l -119.7500 -69.1397"/><path fill="#ff0000" d="M 89.8125 397.5821 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff9300" d="M 119.7500 466.7218 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#fbff00" d="M 119.7500 466.7218 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 89.8125 518.5765 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff9300" d="M 0.0525 518.5765 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#fbff00" d="M 0.0525 518.5765 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff9300" d="M 59.8750 553.1463 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 59.8750 553.1463 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 149.6875 639.5709 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#fbff00" d="M 149.6875 639.5709 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 89.8125 691.4256 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#fbff00" d="M 29.9375 708.7105 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff9300" d="M 29.9375 0.0105 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#49ff00" d="M 29.9375 0.0105 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#fbff00" d="M 29.9375 0.0105 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 29.9375 17.2954 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 29.9375 0.0254 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/><path fill="#ff0000" d="M 149.6875 86.4500 m 0 34.5698 l 59.8750 -34.5698 l 59.8750 34.5698 l 0 68.3604 l -59.8750 34.5698 l -59.8750 -34.5698"/></svg>      </PageWrapper>
    </>
  );
};

export default React.memo(TestPage);
