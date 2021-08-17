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
  BLOG_LINK,
  CHAIN_ID,
  DISCORD_LINK,
  GITHUB_LINK,
  LONDON_EMOJI,
  NOTION_WIKI_LINK,
  OPENSEA_LINK,
  SNAPSHOT_LINK,
  STUDIO_PROD_LINK,
  TOKEN_SYMBOL,
  TWITTER_LINK,
  UNISWAP_TRADE_LINK,
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

export const PageWrapper = styled.div`
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

export const LabelTableColumn = styled(TableColumn)`
  width: 320px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 220px;
  }
`;

export const ValueTableColumn = styled(TableColumn)`
  text-align: right;
`;

export const LinksRow = styled(Flex)`
  a + a {
    margin-left: 12px;
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

const IndexPage: NextPage = () => {
  const [tooltipDatum, setTooltipDatum] = useState<Datum | undefined>(
    undefined,
  );

  const gasInfo = useGasInfo();

  const [gasPriceInWei, setGasPriceInWei] = useState<BigNumber | undefined>(
    undefined,
  );

  const onCurrentGasUseClick = useCallback(() => {
    if (!gasInfo.data?.fast) {
      return;
    }
    setGasPriceInWei(utils.parseUnits(gasInfo.data.fast.toString(), 'gwei'));
  }, [gasInfo]);

  const onGraphUseClick = useCallback(() => {
    if (!tooltipDatum) {
      return;
    }
    setGasPriceInWei(utils.parseUnits(tooltipDatum[0].toString(), 'gwei'));
  }, [tooltipDatum]);

  const { account } = useWeb3React();
  const balance = useLondonBalance(account?.toLowerCase() ?? undefined);

  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  const totalSupply = useTotalSupply();
  const numMintsAt1559Gwei = useNumMints(utils.parseUnits('15.59', 'gwei'));
  const lowestGasPriceMinted = useLowestGasPriceMinted();
  const userMarketCapPercent = useMemo(() => {
    return balance && totalSupply
      ? ((Number(balance) / Number(totalSupply)) * 100).toFixed(2)
      : '0';
  }, [account, balance, totalSupply]);
  const [pageWrapperRef, { width }] = useMeasure();

  const graphWidth = useMemo(() => (width > 450 ? 450 : width), [width]);

  const shopState = useShopState();

  return (
    <>
      <Header />
      <PageWrapper ref={pageWrapperRef as any}>
        {/* <Countdown /> */}
        {/* <IconCircle>
          <Icon src={'/icon.svg'} />
        </IconCircle> */}
        <Title>
          <Bold>{TOKEN_SYMBOL}</Bold>
        </Title>
        <Text style={{ marginBottom: 8 }}>
          <Link href={ROUTES.PFP} passHref>
            <A style={{ color: 'blue', textDecoration: 'underline' }}>
              GET YOUR AVATAR BACKGROUND UPGRADED!
            </A>
            {/* <A style={{ color: 'blue', textDecoration: 'underline' }}>
              {shopState === 'preview' && 'SHOPPE IS OPEN!'}
              {shopState === 'open' && 'SHOPPE IS OPEN!'}
              {shopState === 'revealed' && 'SHOPPE IS OPEN!'}
              {shopState === 'sold-out' && 'SHOPPE HAS SOLD OUT!'}
              {shopState === 'not-open' && 'CHECK OUT THE SHOPPE!'}
            </A> */}
          </Link>
        </Text>
        <Caption>
          A community borne out of a social experiment around EIP-1559, gas
          bidding wars, and the London hardfork.
        </Caption>
        <Text style={{ marginBottom: 4 }}>
          <A
            href={STUDIO_PROD_LINK}
            target={'_blank'}
            style={{ textDecoration: 'none' }}
          >
            <Italic>Proof of Beauty Studios</Italic>
          </A>
        </Text>
        <Text style={{ marginTop: 28 }}>
          <Bold>Abstract</Bold>
        </Text>
        <RightAlignedText>
          Borne out of a{' '}
          <Link passHref href={ROUTES.TOKEN}>
            <A>social experiment</A>
          </Link>
          , <Italic>{TOKEN_SYMBOL}</Italic> is a community of crypto-native
          tinkerers, thought leaders, and makers interested in furthering the
          capacity of the blockchain to create cultural experiences.
        </RightAlignedText>
        <RightAlignedText>
          To participate in the community and DAO, acquire either 1559{' '}
          <Italic>{TOKEN_SYMBOL}</Italic> via a{' '}
          <A href={UNISWAP_TRADE_LINK}>DEX</A> or buy a{' '}
          <Link href={ROUTES.GIFT} passHref>
            <A>
              <Italic>{TOKEN_SYMBOL} Gift NFT</Italic>
            </A>
          </Link>{' '}
          from <A href={OPENSEA_LINK}>Opensea</A>
        </RightAlignedText>
        <RightAlignedText>
          About 43 million <Italic>{TOKEN_SYMBOL}</Italic> tokens and 8888{' '}
          <Italic>{TOKEN_SYMBOL} Gifts</Italic> exist and represent the core
          governance token of the{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL} Night Club DAO</Italic>
          </Bold>
          .
        </RightAlignedText>
        <a
          href={DISCORD_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue' }}
        >
          <SubTitle style={{ marginTop: 48, color: 'blue' }}>
            Join the POB Discord
          </SubTitle>
        </a>
        <a
          href={NOTION_WIKI_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue' }}
        >
          <SubTitle style={{ marginTop: 48, color: 'blue' }}>
            Read the DAO wiki
          </SubTitle>
        </a>
        <a
          href={`/token`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue' }}
        >
          <SubTitle style={{ marginTop: 48, color: 'blue' }}>
            Learn more about the {TOKEN_SYMBOL} token
          </SubTitle>
        </a>
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

// const BetweenContentAndFooterSpacer = styled.div`
//   height: 64px;
//   width: 100%;
//   @media (max-width: ${BREAKPTS.SM}px) {
//     height: 32px;
//   }
// `;

// const MainContent = styled.div`
//   width: 100%;
// `;
