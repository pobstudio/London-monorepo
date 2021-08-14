import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { BellCurve, Datum } from '../components/bellCurve';
import { Countdown } from '../components/countdown';
import { useWeb3React } from '@web3-react/core';
import {
  Text,
  Bold,
  SubTitle,
  RightAlignedText,
  Title,
  Caption,
  Italic,
  ASpan,
  MiniText,
} from '../components/text';
import { A, AButton } from '../components/anchor';
import {
  CHAIN_ID,
  LONDON_EMOJI,
  SNAPSHOT_LINK,
  STUDIO_PROD_LINK,
  TOKEN_SYMBOL,
} from '../constants';
import Link from 'next/link';
import {
  BLOCK_NUMBER_UP_TO,
  MAX_SUPPLY,
  STARTING_INDEX,
} from '../constants/parameters';
import { FlexCenter, Flex, FlexEnds } from '../components/flex';
import { Web3Status } from '../components/web3Status';
import { Mint } from '../components/mint';
import { useGasInfo } from '../hooks/useGasInfo';
import { BigNumber } from '@ethersproject/bignumber';
import { utils } from 'ethers';
import {
  TableColumn,
  TableContainer,
  TableHeader,
  TableRow,
  TableBody,
} from '../components/table';
import { useLondonBalance } from '../hooks/useBalance';
import { shortenHexString } from '../utils/hex';
import { useBlockchainStore } from '../stores/blockchain';
import { useMemo } from 'react';
import { useTotalSupply } from '../hooks/useTotalSupply';
import { useLowestGasPriceMinted, useNumMints } from '../hooks/useNumMints';
import { Header } from '../components/header';
import { Code, MinterCode } from '../components/code';
import {
  getEtherscanAddressUrl,
  getEtherscanTokenUrl,
  getIPFSUrl,
} from '../utils/urls';
import { deployments } from '@pob/protocol';
import { POBIcon } from '../components/icons/pob';
import { BREAKPTS } from '../styles';
import { useMeasure } from 'react-use';
import { ROUTES } from '../constants/routes';
import { useShopState } from '../hooks/useShopState';
import { provenance } from '@pob/sketches';

// import { ContentWrapper } from '../components/content';
// import { Header } from '../components/header';
// import { Footer } from '../components/footer';
// import { BREAKPTS } from '../styles';
// import { YourSagaSection } from '../components/saga-hero-section';
// import { HashInfoSection } from '../components/hash-info-section';
// import { SagaPricingSection } from '../components/saga-pricing-section';
// import { HeroContent } from '../components/home-hero';

const PageWrapper = styled.div`
  /* display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 0.4fr 1fr 0.4fr; */
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

const ConcatStringContainer = styled(RightAlignedText)`
  height: 120px;
  font-size: 10px;
  line-height: 12px;
  overflow-y: scroll;
  overflow-x: hidden;
  word-wrap: break-word;
`;

const IndexPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>Gift Provenance</Bold>
        </Title>
        <Caption style={{ marginBottom: 12 }}>
          Reference of the provenance of each gift NFT
        </Caption>
        <Text style={{ marginTop: 28 }}>
          <Bold>Abstract</Bold>
        </Text>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL} Gift</Italic> is deeply inspired by{' '}
          <A
            href={'https://boredapeyachtclub.com/#/provenance'}
            target={'_blank'}
          >
            BAYC
          </A>
          's provenance design. Each image is hashed using SHA-256, then
          combined by concatenating each SHA-256 hash. Order listed by the order
          below.
        </RightAlignedText>
        <RightAlignedText>
          The{' '}
          <A
            href={getEtherscanAddressUrl(deployments[CHAIN_ID].gift)}
            target="_blank"
            rel="noopener noreferrer"
          >
            proof
          </A>{' '}
          stored on-chain is the SHA-256 hash of the concatenated string.
        </RightAlignedText>
        <RightAlignedText>
          <Bold>Formula to determine ipfs metadata index:</Bold>
        </RightAlignedText>
        <Code style={{ margin: 36 }}>
          tokenIndex + startingIndex = ipfs metadata index
        </Code>
        <RightAlignedText>
          <Bold>Important parameters</Bold>
        </RightAlignedText>
        <RightAlignedText>Starting index = {STARTING_INDEX}</RightAlignedText>
        <RightAlignedText>
          Provenance = 0x{provenance.provenance}
        </RightAlignedText>
        <RightAlignedText>Concatenated hash string =</RightAlignedText>
        <ConcatStringContainer>
          0x{provenance.imageConcatStr}
        </ConcatStringContainer>
        <SubTitle style={{ marginTop: 48 }}>Assets list</SubTitle>
        <RightAlignedText style={{ marginBottom: 24 }}>
          Token Index | Assigned metadata index | SHA-256 hash | ipfs file
        </RightAlignedText>
        {Array.apply(null, Array(MAX_SUPPLY)).map((_, i) => {
          return (
            <Code key={`asset-row-${i}`}>
              {`${((i < STARTING_INDEX ? i + 8888 : i) - STARTING_INDEX)
                .toString()
                .padStart(4, '0')} | ${(i < STARTING_INDEX ? i + 8888 : i)
                .toString()
                .padStart(4, '0')} | 0x${
                provenance.provenanceAndImage[i][0]
              } | `}
              <A
                href={getIPFSUrl(provenance.provenanceAndImage[i][1].slice(7))}
                target={'blank'}
              >
                IPFS
              </A>
            </Code>
          );
        })}
        <MiniText>Omne quod movetur ab alio movetur</MiniText>
        <FlexCenter style={{ margin: '24px 0' }}>
          <POBIcon />
        </FlexCenter>
      </PageWrapper>
    </>
  );
};

export default React.memo(IndexPage);
