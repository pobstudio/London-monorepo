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
import { BLOCK_NUMBER_UP_TO } from '../constants/parameters';
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
import { ERC20Code, MinterCode } from '../components/code';
import { getEtherscanAddressUrl, getEtherscanTokenUrl } from '../utils/urls';
import { deployments } from '@pob/protocol';
import { POBIcon } from '../components/icons/pob';
import { BREAKPTS } from '../styles';
import { useMeasure } from 'react-use';
import { ROUTES } from '../constants/routes';
import { useShopState } from '../hooks/useShopState';
import { AvatarCanvas } from '../components/avatar';

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

const BottomContainer = styled(FlexEnds)`
  align-items: flex-end;
  position: absolute;
  bottom: 14px;
  right: 14px;
  left: 14px;
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

const IconCircle = styled.div`
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #c5efff;
  border-radius: 999px;
  margin-bottom: 40px;
`;

const Icon = styled.img`
  display: block;
  width: 70px;
  height: 70px;
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

const AvatarConsole = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid black;
  margin-top: 24px;
`;

const AvatarLeftWell = styled.div`
  height: 100%;
  border-right: 1px solid black;
`;

const IndexPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        {/* <Countdown /> */}
        {/* <IconCircle>
          <Icon src={'/icon.svg'} />
        </IconCircle> */}
        <Title>
          <Bold>$LONDON</Bold> background change service
        </Title>
        <Caption>
          <Italic>Complementary service for all avatars!</Italic>
        </Caption>
        <AvatarConsole>
          <AvatarLeftWell>
            <AvatarCanvas
              foregroundImageSrc={
                'https://lh3.googleusercontent.com/JDz86_qE-kHyYOoumnxQtOTHsd3IqknC7cv7-zemonq709CrBCLU7G4IR0C4DyTMT-go7DjHi_4Q-dgW7ZSHOapM8VmfahURwnIH=w600'
              }
              backgroundImageSrc={
                'https://bafybeiaxk2s7ma4p4jjh2j6ix5zxvnynekfa6ey4q5iyvch4kqyrdnynzy.ipfs.dweb.link/'
              }
            />
          </AvatarLeftWell>
        </AvatarConsole>
      </PageWrapper>
    </>
  );
};

const AnchorList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 160px;
  > a {
    /* display: block; */
  }
  a + a {
    margin-top: 12px;
  }
`;

export default React.memo(IndexPage);
