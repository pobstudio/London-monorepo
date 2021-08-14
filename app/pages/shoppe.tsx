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
  OPENSEA_ASSET_NAME,
  SNAPSHOT_LINK,
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

const LabelTableColumn = styled(TableColumn)`
  width: 320px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 220px;
  }
`;

const ValueTableColumn = styled(TableColumn)`
  text-align: right;
`;

const PRETTY_RARITY_LABEL: { [key: string]: string } = {
  common: 'common',
  rare: 'rare',
  superRare: 'super rare',
  secretRare: 'secret rare',
};

const Rarity = () => {
  const shopState = useShopState();

  return (
    <>
      <a
        href={`https://pob.mirror.xyz/jNuwasIPdCnUfJNCgibslzIcUsSFWmPV8hDailzwDAs`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'blue' }}
      >
        <SubTitle style={{ marginTop: 48, color: 'blue' }}>
          Read: The story behind <i>$LONDON Gift Shoppe</i> art
        </SubTitle>
      </a>
      <a
        href={`https://rarity.tools/london-gift-v2`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'blue' }}
      >
        <SubTitle style={{ marginTop: 48, color: 'blue' }}>
          See: Rarity.Tools dashboard
        </SubTitle>
      </a>
      <SubTitle style={{ marginTop: 48 }}>Rarity</SubTitle>
      <RightAlignedText>
        The generative art comes with varying rarity mainly captured by the{' '}
        <Bold>rarity</Bold> attribute.
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
          <LabelTableColumn>
            <Bold>Rarity</Bold>
          </LabelTableColumn>
          <ValueTableColumn>Chance</ValueTableColumn>
        </TableHeader>
        <TableBody>
          {Object.entries(RARITY).map((r) => {
            return (
              <TableRow>
                <LabelTableColumn>{PRETTY_RARITY_LABEL[r[0]]}</LabelTableColumn>
                <ValueTableColumn>
                  {shopState === 'open' || shopState === 'sold-out'
                    ? `${r[1] * 100}%`
                    : '???'}
                </ValueTableColumn>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
      <RightAlignedText>
        <Italic>Percentages revealed after grand opening</Italic>
      </RightAlignedText>
      <RightAlignedText>
        Each rarity tier selects from a group of unique <Bold>Tile sets</Bold>.
        Each tile set produces unique visual output, distinctive from one
        another.
      </RightAlignedText>
      {Object.entries(RARITY_TILE_MAP).map((r) => {
        return (
          <RightAlignedText>
            <Bold>{PRETTY_RARITY_LABEL[r[0]]}</Bold>
            {' - '}
            {r[1].join(', ')}
          </RightAlignedText>
        );
      })}
      <RightAlignedText>
        The length of the gift's name is another rarity factor.
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
          <LabelTableColumn>
            <Bold>Num words in name</Bold>
          </LabelTableColumn>
          <ValueTableColumn>Chance</ValueTableColumn>
        </TableHeader>
        <TableBody>
          {Object.entries(NAMES_RARITY_MAP).map((r) => {
            return (
              <TableRow>
                <LabelTableColumn>{r[0]}</LabelTableColumn>
                <ValueTableColumn>
                  {shopState === 'open' || shopState === 'sold-out'
                    ? `${r[1] * 100}%`
                    : '???'}
                </ValueTableColumn>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
      <RightAlignedText>
        {shopState === 'open' || shopState === 'sold-out' ? `${30}` : '???'}{' '}
        NFTs will have unique hand written names. The rest will be
        pseudo-random.
      </RightAlignedText>
      <RightAlignedText>
        There is a few other attributes <Italic>(Complexity, Framed)</Italic>{' '}
        that influence the artwork that occur rarer than others. We will let the
        folks figure those out.
      </RightAlignedText>
      <RightAlignedText>
        With the right combination of attributes, some truly cool/beautiful
        pieces may be <Bold>one of a kind</Bold>.
      </RightAlignedText>
    </>
  );
};

const FAQ = () => {
  return (
    <>
      <SubTitle style={{ marginTop: 48 }}>FAQ</SubTitle>
      <RightAlignedText>
        <Bold>How many LONDON gift will exist?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        There will be a supply of {MAX_SUPPLY}.
      </RightAlignedText>
      <RightAlignedText>
        <Bold>When does the shoppe open?</Bold>
      </RightAlignedText>
      <RightAlignedText>Right after the LONDON hardfork.</RightAlignedText>
      <RightAlignedText>
        <Bold>How much to mint?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        Just pay the fare of 1559 {TOKEN_SYMBOL}.
      </RightAlignedText>
      <RightAlignedText>
        <Bold>Is there any restrictions to minting?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        Up to {BLOCK_NUMBER_UNLOCK_START_AT} (12 hrs after the hardfork), there
        is a {MAX_MINT_NOT_UNLOCKED} mint per address limit. After{' '}
        {BLOCK_NUMBER_UNLOCK_START_AT} you can mint as many as you want. You can
        mint {MAX_MINT_PER_TX} gifts per txn.
      </RightAlignedText>
      <RightAlignedText>
        <Bold>When will the tokens be revealed?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        36 hours after the hardfork OR all the gifts have been minted.
      </RightAlignedText>
      <RightAlignedText>
        <Bold>What if I miss out on the sale?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        Your {TOKEN_SYMBOL} still holds value as voting power in the{' '}
        <A href={`${SNAPSHOT_LINK}`} target="_blank" rel="noopener noreferrer">
          <Italic>{TOKEN_SYMBOL}</Italic> Night Club
        </A>
        . In the future, the DAO can comission more artistic experiments for{' '}
        {TOKEN_SYMBOL} holders.
      </RightAlignedText>
      <RightAlignedText>
        <Bold>What comes after for the gift/shoppe?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        That is left to the{' '}
        <A href={`${SNAPSHOT_LINK}`} target="_blank" rel="noopener noreferrer">
          <Italic>{TOKEN_SYMBOL}</Italic> Night Club
        </A>{' '}
        to decide!
      </RightAlignedText>
      <RightAlignedText>
        <Bold>Where do the proceeds go to?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        All proceeds will be directed to a gnosis{' '}
        <A
          href={getEtherscanAddressUrl(deployments[CHAIN_ID].multisig)}
          target={'_blank'}
        >
          multisig
        </A>
        .
      </RightAlignedText>
      <RightAlignedText>
        <Bold>How much of the proceeds will be burnt?</Bold>
      </RightAlignedText>
      <RightAlignedText>
        After the sale, we will be burning 15.59% of the proceeds. After the
        burn, the descisions of what to do with the capital will be left to the
        community.
      </RightAlignedText>
    </>
  );
};

const PreviewImg = styled.img`
  display: block;
  width: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 320px;
  }
`;

const CoreMinting = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.01);
  box-shadow: inset 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 16px 16px 32px;
  margin: 24px 0;
  width: 100%;
`;
const CoreMintingInner = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
`;

const GiftShopPage: NextPage = () => {
  const shopState = useShopState();

  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>{TOKEN_SYMBOL}</Bold> Gift Shoppe
        </Title>
        <Caption>
          <Italic>
            {shopState === 'not-open' &&
              'Still setting up the register and shelving...'}
            {shopState === 'open' && 'Grand opening!'}
            {shopState === 'preview' && 'We are open! 1 per address for now.'}
            {shopState === 'revealed' && 'NFTs have been revealed!'}
            {shopState === 'sold-out' && <A href={'/provenance'}>Provenance</A>}
          </Italic>
        </Caption>
        <Caption style={{ marginBottom: 12 }}>
          {MAX_SUPPLY}{' '}
          <A href={getOpenSeaCollectionUrl(OPENSEA_ASSET_NAME)}>
            generative art mementos
          </A>{' '}
          each costing 1559 {TOKEN_SYMBOL} to mint. While supplies last.
        </Caption>
        <div style={{ margin: '24px 0' }}>
          <PreviewImg src={'/preview.gif'} />
          <MiniText style={{ paddingTop: 8, textAlign: 'center' }}>
            Sneak preview of 10 NFTs.
          </MiniText>
        </div>
        <CoreMinting>
          <CoreMintingInner>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <Text style={{ marginBottom: 20 }}>
                <strong>
                  MINT <Italic>{TOKEN_SYMBOL} GIFT</Italic>
                </strong>
              </Text>
              <MintGift />
            </div>
          </CoreMintingInner>
        </CoreMinting>
        <Rarity />
        <FAQ />
        <MiniText style={{ marginTop: 48 }}>
          Omne quod movetur ab alio movetur
        </MiniText>
        <FlexCenter style={{ margin: '24px 0' }}>
          <POBIcon />
        </FlexCenter>
      </PageWrapper>
    </>
  );
};

export default React.memo(GiftShopPage);
