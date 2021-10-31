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
  DAO_TWITTER_LINK,
} from '../constants';
import {
  BLOCK_NUMBER_UNLOCK_START_AT,
  BURN_AIDROP_FEE,
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
import { Footer } from '../components/footer';
import { PFP } from '../components/pfp';
import { Banner } from '../components/banner';
import { utils } from 'ethers';

// import { ContentWrapper } from '../components/content';
// import { Header } from '../components/header';
// import { Footer } from '../components/footer';
// import { BREAKPTS } from '../styles';
// import { YourSagaSection } from '../components/saga-hero-section';
// import { HashInfoSection } from '../components/hash-info-section';
// import { SagaPricingSection } from '../components/saga-pricing-section';
// import { HeroContent } from '../components/home-hero';

const LabelTableColumn = styled(TableColumn)`
  width: 320px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 220px;
  }
`;

const ValueTableColumn = styled(TableColumn)`
  text-align: right;
`;

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

const BurnPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>LONDON</Bold> Embers
        </Title>
        <Caption>
          <Italic>
            {true && '[Coming soon] Buying butane at the local shoppe...'}
            {/* {shopState === 'open' && 'Grand opening!'}
            {shopState === 'preview' && 'We are open! 1 per address for now.'}
            {shopState === 'revealed' && 'NFTs have been revealed!'}
            {shopState === 'sold-out' && <A href={'/provenance'}>Provenance</A>} */}
          </Italic>
        </Caption>
        {/* <Text style={{ marginBottom: 8 }}>
          <Link passHref href={ROUTES.DAO}>
            <A style={{ color: 'blue', textDecoration: 'underline' }}>
              Learn more about the {LONDON_DAO_TITLE}
            </A>
          </Link>
        </Text> */}
        <Caption style={{ marginBottom: 4 }}>
          <A href="#">Fully on-chain mementos</A> created by
          burning London Gift + Embers.
        </Caption>
        <Text style={{ marginBottom: 12 }}>
          <Italic>Is it getting hot or is it just me?</Italic>
        </Text>
        <SubTitle style={{ marginTop: 48 }}>Burn GIFT</SubTitle>
        <SubTitle style={{ marginTop: 48 }}>Burn Embers</SubTitle>
        <SubTitle style={{ marginTop: 48 }}>Public sale</SubTitle>
        <SubTitle style={{ marginTop: 48 }}>Airdrop</SubTitle>
        <RightAlignedText>
          <Bold>LONDON</Bold> Embers will be airdropped to nobility rankings.
          Check the table below to see if you qualify for a nobility rank. A
          one-time fee of 1559 {TOKEN_SYMBOL} needs to be paid to redeem
          airdrop.
        </RightAlignedText>
        <TableContainer
          style={{
            marginTop: 48,
            marginBottom: 48,
            border: '1px solid black',
            background: 'white',
          }}
        >
          <TableHeader>
            <LabelTableColumn>Nobility Ranking</LabelTableColumn>
            <ValueTableColumn>
              {TOKEN_SYMBOL} or GIFT to qualify
            </ValueTableColumn>
          </TableHeader>
          <TableBody>
            <TableRow>
              <LabelTableColumn>Baron/Baroness</LabelTableColumn>
              <ValueTableColumn>50,000</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Earl/Countess</LabelTableColumn>
              <ValueTableColumn>100,000</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Duke/Duchess</LabelTableColumn>
              <ValueTableColumn>300,000</ValueTableColumn>
            </TableRow>
          </TableBody>
        </TableContainer>
        <RightAlignedText
        >
          A GIFT is valued at 10,000 {TOKEN_SYMBOL}. For example, if you own 5 GIFT NFTs, that would qualify you as a Baron/Baroness.
        </RightAlignedText>
        <RightAlignedText
        >
          Embers are airdropped based on your nobility at the time of snapshot.
        </RightAlignedText> 
        <TableContainer
          style={{
            marginTop: 48,
            marginBottom: 48,
            border: '1px solid black',
            background: 'white',
          }}
        >
          <TableHeader>
            <LabelTableColumn>Nobility Ranking</LabelTableColumn>
            <ValueTableColumn># Embers airdropped</ValueTableColumn>
          </TableHeader>
          <TableBody>
            <TableRow>
              <LabelTableColumn>Baron/Baroness</LabelTableColumn>
              <ValueTableColumn>2</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Earl/Countess</LabelTableColumn>
              <ValueTableColumn>5</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Duke/Duchess</LabelTableColumn>
              <ValueTableColumn>16</ValueTableColumn>
            </TableRow>
          </TableBody>
        </TableContainer>
        <RightAlignedText>
          Snapshot of qualifying addresses will be conducted soon. Stay tuned on{' '}
          <A target={'_blank'} href={DAO_TWITTER_LINK}>
            @LondonDAO
          </A>{' '}
          for updates.
          </RightAlignedText>
        <Footer/>
        {/* <div style={{ margin: '24px 0' }}>
          <MiniText style={{ paddingTop: 8, textAlign: 'center' }}>
            Preview of 10 NFTs.
          </MiniText>
        </div> */}
        {/* <CoreMinting>
          <CoreMintingInner>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <Text style={{ marginBottom: 20 }}>
                <strong>
                  MINT <Italic>LONDON GIFT</Italic>
                </strong>
              </Text>
              <MintGift />
            </div>
          </CoreMintingInner>
        </CoreMinting> */}
      </PageWrapper>
    </>
  );
};

export default React.memo(BurnPage);
