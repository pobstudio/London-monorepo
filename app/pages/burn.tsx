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
  MERGE_LINK,
  TOKEN_SYMBOL,
  DAO_TWITTER_LINK,
  ULTRASOUND_LINK,
} from '../constants';
import {
  BLOCK_NUMBER_UNLOCK_START_AT,
  BURN_AIDROP_FEE,
  BURN_ETERNAL_MINTABLE_SUPPLY,
  BURN_LONDON_FEE_FOR_GIFTS,
  BURN_MAX_PRISTINE_AMOUNT_PER_MINT,
  BURN_BASE_LONDON_FEE_FOR_SELF,
  BURN_PRICE_PER_PRISTINE_MINT,
  BURN_PRISTINE_MINTABLE_SUPPLY,
  MAX_MINT_NOT_UNLOCKED,
  MAX_MINT_PER_TX,
  MAX_SUPPLY,
  BURN_LONDON_FEE_FOR_SELF,
  BURN_MAX_AMOUNT_GIFTS,
  BURN_MIN_MAX_AMOUNT_FOR_GIFTS,
  BURN_MIN_MAX_AMOUNT_FOR_SELF,
} from '../constants/parameters';
import { Header } from '../components/header';
import {
  ADVANCED_FRAME_CT_AND_WEIGHT,
  BASIC_FRAME_CT_AND_WEIGHT,
  FRAME_CT_TO_LABEL,
  FRAME_POINTILISM_AND_WEIGHT,
  FRAME_POINTILISM_TO_LABEL,
  GRID_SIZE_AND_WEIGHT,
  GRID_SIZE_TO_LABEL,
  NAMES_RARITY_MAP,
  RARITY,
  RARITY_TILE_MAP,
} from '@pob/sketches';
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
import { ethers, utils } from 'ethers';
import { Code } from '../components/code';
import { NobleAirdrop } from '../components/embers/mintNoble';
import { useMemo } from 'react';
import { PristineMint } from '../components/embers/mintPristine';
import { AshenAndGiftMint } from '../components/embers/mintAshenAndGift';

// import { ContentWrapper } from '../components/content';
// import { Header } from '../components/header';
// import { Footer } from '../components/footer';
// import { BREAKPTS } from '../styles';
// import { YourSagaSection } from '../components/saga-hero-section';
// import { HashInfoSection } from '../components/hash-info-section';
// import { SagaPricingSection } from '../components/saga-pricing-section';
// import { HeroContent } from '../components/home-hero';

const PreviewImg = styled.img`
  display: block;
  width: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 320px;
  }
`;

const LabelTableColumn = styled(TableColumn)``;

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
  width: 100%;
  margin: auto;
  > p + p {
    margin-top: 20px;
  }
`;

const Spacer = styled.div`
  height: 128px;
`;

const DAOMints: FC = () => {
  return (
    <>
      <SubTitle style={{ marginTop: 48 }}>{LONDON_DAO_TITLE}</SubTitle>
      <RightAlignedText>
        All <Bold>{TOKEN_SYMBOL}</Bold> proceeds from mints will be directed to
        the <Bold>{LONDON_DAO_TITLE}</Bold>.
      </RightAlignedText>
      <RightAlignedText>
        {BURN_ETERNAL_MINTABLE_SUPPLY.toString()} Embers will be given to the{' '}
        {LONDON_DAO_TITLE} for giveaway and other growth purposes.
      </RightAlignedText>
    </>
  );
};

const Airdrop: FC = () => {
  return (
    <>
      <SubTitle style={{ marginTop: 48 }}>Airdrop</SubTitle>
      <RightAlignedText>
        <Bold>LONDON</Bold> Embers will be airdropped based on nobility
        rankings. Check the table below to see if you qualify for a nobility
        rank.
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
          <ValueTableColumn>{TOKEN_SYMBOL}/GIFT to qualify</ValueTableColumn>
          <ValueTableColumn># Embers airdropped</ValueTableColumn>
        </TableHeader>
        <TableBody>
          <TableRow>
            <LabelTableColumn>Baron/Baroness</LabelTableColumn>
            <ValueTableColumn>50,000</ValueTableColumn>
            <ValueTableColumn>2</ValueTableColumn>
          </TableRow>
          <TableRow>
            <LabelTableColumn>Earl/Countess</LabelTableColumn>
            <ValueTableColumn>100,000</ValueTableColumn>
            <ValueTableColumn>5</ValueTableColumn>
          </TableRow>
          <TableRow>
            <LabelTableColumn>Duke/Duchess</LabelTableColumn>
            <ValueTableColumn>300,000</ValueTableColumn>
            <ValueTableColumn>16</ValueTableColumn>
          </TableRow>
        </TableBody>
      </TableContainer>
      <RightAlignedText>
        A GIFT is valued at 10,000 {TOKEN_SYMBOL}. For example, if you own 5
        GIFT NFTs, that would qualify you as a Baron/Baroness.
      </RightAlignedText>
      <RightAlignedText>
        Embers are airdropped based on your nobility at the time of snapshot.
      </RightAlignedText>

      <RightAlignedText>
        Snapshot of qualifying addresses will be conducted soon. Stay tuned on{' '}
        <A target={'_blank'} href={DAO_TWITTER_LINK}>
          @LondonDAO
        </A>{' '}
        for updates.
      </RightAlignedText>
      <RightAlignedText>
        After <A href={MERGE_LINK}>the merge</A>, minting airdropped{' '}
        <Bold>LONDON</Bold> Embers will be shut off forever.
      </RightAlignedText>
    </>
  );
};

const PublicSale: FC = () => {
  return (
    <>
      <SubTitle style={{ marginTop: 48 }}>Public sale</SubTitle>
      <RightAlignedText>
        Along with airdrop and burning,{' '}
        {BURN_PRISTINE_MINTABLE_SUPPLY.toString()} Embers can be acquired via a
        public sale for {1559} <Bold>{TOKEN_SYMBOL}</Bold>. A maximum of{' '}
        {BURN_MAX_PRISTINE_AMOUNT_PER_MINT.toString()} Embers can be minted per
        txn.
      </RightAlignedText>
    </>
  );
};

const BurnGift: FC = () => {
  return (
    <>
      <SubTitle style={{ marginTop: 48 }}>Burn GIFT</SubTitle>
      <RightAlignedText>
        The main way to receive Embers is through the burning of Gifts. You can
        burn between {BURN_MIN_MAX_AMOUNT_FOR_GIFTS[0]}-
        {BURN_MIN_MAX_AMOUNT_FOR_GIFTS[1]} Gifts to receive Embers as derived by
        this equation:
      </RightAlignedText>
      <Code style={{ margin: 36 }}>
        # EMBERs minted = (# GIFTs burned) * 2 - 1
      </Code>
      <RightAlignedText>
        You will also need to pay a <Bold>{TOKEN_SYMBOL}</Bold> fee derived by
        this equation:
      </RightAlignedText>
      <Code style={{ marginTop: 36 }}>
        {TOKEN_SYMBOL} fee to mint EMBERs = ((2 * GIFTs burned - 1) / (GIFTs
        burned)) ^ 3
      </Code>
      <TableContainer
        style={{
          marginTop: 48,
          marginBottom: 48,
          border: '1px solid black',
          background: 'white',
        }}
      >
        <TableHeader>
          <LabelTableColumn># GIFTs burnt</LabelTableColumn>
          <ValueTableColumn>{TOKEN_SYMBOL} Fee</ValueTableColumn>
        </TableHeader>
        <TableBody>
          {Object.entries(BURN_LONDON_FEE_FOR_GIFTS).map(([n, f]) => {
            return (
              <TableRow>
                <LabelTableColumn>{n}</LabelTableColumn>
                <ValueTableColumn>{utils.formatEther(f)}</ValueTableColumn>
              </TableRow>
            );
          })}
        </TableBody>
      </TableContainer>
      <RightAlignedText>
        For example, if you burn 6 Gifts, that would mint you 11 Embers at a fee
        of {utils.formatEther(BURN_LONDON_FEE_FOR_GIFTS[6])}{' '}
        <Bold>{TOKEN_SYMBOL}</Bold>. These equations are chosen to incentive
        larger burn quantities.
      </RightAlignedText>
      <RightAlignedText>
        A maximum of {BURN_MAX_AMOUNT_GIFTS} Gifts can be burned to mint Embers.
      </RightAlignedText>
      <RightAlignedText>
        After <A href={MERGE_LINK}>the merge</A>, burning any amount of Gifts
        will always net you only one Ember.
      </RightAlignedText>
    </>
  );
};

const BurnAshen: FC = () => {
  return (
    <>
      <SubTitle style={{ marginTop: 48 }}>Burn Embers</SubTitle>
      <RightAlignedText>
        Embers can also be burnt to receive new Embers. You can burn between{' '}
        {BURN_MIN_MAX_AMOUNT_FOR_SELF[0]}-{BURN_MIN_MAX_AMOUNT_FOR_SELF[1]}{' '}
        Embers to receive new Embers as derived by this equation:
      </RightAlignedText>
      <Code style={{ margin: 36 }}># Embers minted = # Embers burned - 1</Code>
      <RightAlignedText>
        To burn Embers for Embers, you will also need to pay a{' '}
        <Bold>{TOKEN_SYMBOL}</Bold> fee derived by this equation:
      </RightAlignedText>
      <Code style={{ marginTop: 36, marginBottom: 36 }}>
        {TOKEN_SYMBOL} fee to mint Embers = 1559 <Bold>{TOKEN_SYMBOL}</Bold> * #
        Embers burned
      </Code>
      <RightAlignedText>
        For example, if you burn 4 Embers, that would mint you 3 Embers at a fee
        of {utils.formatEther(BURN_LONDON_FEE_FOR_SELF[4])}{' '}
        <Bold>{TOKEN_SYMBOL}</Bold>.
      </RightAlignedText>
    </>
  );
};

const CoreMinting = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.01);
  box-shadow: inset 0 0 10px 0 rgba(0, 0, 0, 0.1);
  padding: 16px 16px 32px;
  margin: 24px 0;
  width: 800px;
`;
const CoreMintingInner = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
`;

const BurnPage: NextPage = () => {
  const randomNum = useMemo(() => {
    return Math.floor(Math.random() * (10 - 0) + 0);
  }, []);
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>LONDON</Bold> Embers
        </Title>
        <Caption style={{ marginBottom: 4 }}>
          <A href="#">Gen art</A> created by burning London Gift + Embers.
        </Caption>
        <Text style={{ marginBottom: 12 }}>
          <Italic>Is it getting hot or is it just me?</Italic>
        </Text>
        <div style={{ margin: '24px 0' }}>
          <PreviewImg src={`/embers/${randomNum}.svg`} />
          <MiniText style={{ paddingTop: 8, textAlign: 'center' }}>
            Preview of EMBERS.
          </MiniText>
        </div>
        {/* <Text style={{ marginTop: 28 }}>
          <Bold>Abstract</Bold>
        </Text>
        <RightAlignedText>
          <Bold>LONDON</Bold> Embers are the second installment in our
          celebration of the transition of ETH towards ETH 2.0. Inspired by{' '}
          <A href={ULTRASOUND_LINK}>EIP-1559</A>, LONDON EMBERs are minted via
          the burning of{' '}
          <A href={getOpenSeaCollectionUrl(OPENSEA_ASSET_NAME)}>Gifts</A> or
          Embers.
        </RightAlignedText> */}
        {/* <CoreMinting>
          <CoreMintingInner>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <Text style={{ marginBottom: 20 }}>
                <strong>
                  MINT <Italic>EMBERs</Italic>
                </strong>
              </Text>
              <PristineMint />
              <div style={{ marginTop: 24 }}>
                <AshenAndGiftMint/>
              </div>
              <div style={{ marginTop: 24 }}>
                <NobleAirdrop />
              </div>
            </div>
          </CoreMintingInner>
        </CoreMinting> */}
        <SubTitle style={{ marginTop: 48 }}>Rarity</SubTitle>
        <RightAlignedText>
          <Bold>LONDON</Bold> Embers rarity design is designed with minimalism
          in mind; it has a few core attributes, if aligned correctly, can
          produce widly different and expressive EMBERs.
        </RightAlignedText>
        <RightAlignedText>
          The attributes are: <Bold>provenance</Bold>, <Bold>gridSize</Bold>,{' '}
          <Bold>animationDuration</Bold>, and <Bold>animationStyle</Bold>.
        </RightAlignedText>
        <RightAlignedText>
          <Bold>provenance</Bold> attribute identifies how the EMBER was minted.{' '}
          <Bold>provenance</Bold> is a key factor to how other attributes are
          generated.
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
              <Bold>Provenance</Bold>
            </LabelTableColumn>
            <ValueTableColumn>from</ValueTableColumn>
          </TableHeader>
          <TableBody>
            <TableRow>
              <LabelTableColumn>Noble</LabelTableColumn>
              <ValueTableColumn>airdrop</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Gift</LabelTableColumn>
              <ValueTableColumn>burning GIFT</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Pristine</LabelTableColumn>
              <ValueTableColumn>public sale</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Eternal</LabelTableColumn>
              <ValueTableColumn>DAO minted</ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Ashen</LabelTableColumn>
              <ValueTableColumn>burning EMBER</ValueTableColumn>
            </TableRow>
          </TableBody>
        </TableContainer>
        <RightAlignedText>
          <Bold>gridSize</Bold>, as the name suggests, controls the size of the
          grid, the larger the grid the more 'complex' the art appears.
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
              <Bold>Grid Size</Bold>
            </LabelTableColumn>
            <ValueTableColumn>Chance</ValueTableColumn>
          </TableHeader>
          <TableBody>
            {Object.entries(GRID_SIZE_TO_LABEL).map((r, index) => {
              return (
                <TableRow key={`table-row-state-${index}`}>
                  <LabelTableColumn>{`${r[1]} (${r[0]}x${r[0]})`}</LabelTableColumn>
                  <ValueTableColumn>
                    {GRID_SIZE_AND_WEIGHT[1][index] * 100}%
                  </ValueTableColumn>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <RightAlignedText>
          <Bold>animationDuration</Bold> controls how long the animation lasts.
          The weighting of <Bold>animationDuration</Bold> depends on{' '}
          <Bold>provenance</Bold>.
        </RightAlignedText>
        <RightAlignedText>
          If <Bold>provenance</Bold> is <Italic>Noble</Italic>,{' '}
          <Italic>Pristine</Italic>, or <Italic>Eternal</Italic>, the weights
          are the following:
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
              <Bold>Duration</Bold>
            </LabelTableColumn>
            <ValueTableColumn>Chance</ValueTableColumn>
          </TableHeader>
          <TableBody>
            {Object.entries(FRAME_CT_TO_LABEL).map((r, index) => {
              return (
                <TableRow key={`table-row-state-${index}`}>
                  <LabelTableColumn>{`${r[1]} (${r[0]} frame${
                    index === 0 ? '' : 's'
                  })`}</LabelTableColumn>
                  <ValueTableColumn>
                    {BASIC_FRAME_CT_AND_WEIGHT[1][index] * 100}%
                  </ValueTableColumn>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <RightAlignedText>
          If <Bold>provenance</Bold> is <Italic>Ashen</Italic> or{' '}
          <Italic>Gift</Italic>, the weights are the following:
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
              <Bold>Duration</Bold>
            </LabelTableColumn>
            <ValueTableColumn>Chance</ValueTableColumn>
          </TableHeader>
          <TableBody>
            {Object.entries(FRAME_CT_TO_LABEL).map((r, index) => {
              return (
                <TableRow key={`table-row-state-${index}`}>
                  <LabelTableColumn>{`${r[1]} (${r[0]} frame${
                    index === 0 ? '' : 's'
                  })`}</LabelTableColumn>
                  <ValueTableColumn>
                    {ADVANCED_FRAME_CT_AND_WEIGHT[1][index] * 100}%
                  </ValueTableColumn>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <RightAlignedText>
          These weights are selected to push users to burn EMBERs and GIFTs.
        </RightAlignedText>
        <RightAlignedText>
          Finally, <Bold>animationStyle</Bold> controls how the animation is
          generated.
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
              <Bold>Duration</Bold>
            </LabelTableColumn>
            <ValueTableColumn>Chance</ValueTableColumn>
          </TableHeader>
          <TableBody>
            {Object.entries(FRAME_POINTILISM_TO_LABEL).map((r, index) => {
              return (
                <TableRow key={`table-row-state-${index}`}>
                  <LabelTableColumn>{`${r[1]}`}</LabelTableColumn>
                  <ValueTableColumn>
                    {FRAME_POINTILISM_AND_WEIGHT[1][index] * 100}%
                  </ValueTableColumn>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <RightAlignedText>
          There are a few other bells and whistles thrown in the EMBER
          generation process that will be left to users to figure out, the name
          of the EMBER NFTs being one of them.
        </RightAlignedText>
        <BurnGift />
        <BurnAshen />
        <Airdrop />
        <PublicSale />
        <DAOMints />
        <Spacer />
        <Footer />
      </PageWrapper>
    </>
  );
};

export default React.memo(BurnPage);
