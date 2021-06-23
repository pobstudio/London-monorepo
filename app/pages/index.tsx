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
  Italic,
  ASpan,
  MiniText,
} from '../components/text';
import { A, AButton } from '../components/anchor';
import { CHAIN_ID, LONDON_EMOJI, TOKEN_SYMBOL } from '../constants';
import { BLOCK_NUMBER_UP_TO } from '../constants/parameters';
import { FlexCenter, Flex, FlexEnds } from '../components/flex';
import { Web3Status } from '../components/web3Status';
import { Mint } from '../components/mint';
import { Arrow } from '../components/icons/arrow';
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
import { useNumMints } from '../hooks/useNumMints';
import { Header } from '../components/header';
import { ERC20Code, MinterCode } from '../components/code';
import { getEtherscanAddressUrl } from '../utils/urls';
import { deployments } from '@pob/protocol';

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

const StyledArrow = styled(Arrow)`
  margin: 0 12px;
`;

const LabelTableColumn = styled(TableColumn)`
  width: 320px;
`;

const ValueTableColumn = styled(TableColumn)`
  text-align: right;
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

  return (
    <>
      <Header />
      <PageWrapper>
        {/* <Countdown /> */}
        <Title style={{ marginBottom: 36 }}>
          <Bold>{TOKEN_SYMBOL}</Bold>: A social currency backed by the lasting
          impact of minting, gas price manipulation, and EIP 1559
        </Title>
        <Text>
          <Italic>POB studios</Italic>
        </Text>
        <Text style={{ marginTop: 28 }}>
          <Bold>Abstract</Bold>
        </Text>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL}</Italic> is an{' '}
          <A
            href={getEtherscanAddressUrl(deployments[CHAIN_ID].erc20)}
            target={'_blank'}
          >
            ERC20
          </A>{' '}
          where the amount of tokens minted is directly tied to gas price. The
          amount of <Italic>{TOKEN_SYMBOL}</Italic> minted is bonded to the gas
          price of the txn via a curve (See Figure 1). Because the bonding curve
          doesn't reward gas bidding wars, users will need to coordinate in new
          ways to optimize their <Italic>{TOKEN_SYMBOL}</Italic> returns.
        </RightAlignedText>
        <RightAlignedText>
          Any user can mint until the{' '}
          <A
            href={'https://github.com/openethereum/openethereum/issues/395'}
            target={'_blank'}
          >
            London hardfork
          </A>{' '}
          since{' '}
          <A
            href={
              'https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md'
            }
            target={'_blank'}
          >
            EIP 1559
          </A>{' '}
          radically changes how the fee market works.{' '}
          <Italic>{TOKEN_SYMBOL}</Italic> is a fair launch project, there is no
          starting supply.
        </RightAlignedText>
        <RightAlignedText>
          Blocks left until{' '}
          <A
            href={'https://github.com/openethereum/openethereum/issues/395'}
            target={'_blank'}
          >
            London hardfork
          </A>{' '}
          + <Italic>{TOKEN_SYMBOL}</Italic> minting shut off:{' '}
          <Bold>{blocksLeft ?? '-'}</Bold>
        </RightAlignedText>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL}</Italic> is a highly experimental project
          designed to show the fragility/robustness of the ETH fee markets. It
          is also a celebration/critique of our relationship with miners and
          core developers. Join the movement, each{' '}
          <Italic>{TOKEN_SYMBOL}</Italic> is a memento of your part in this
          experience.
        </RightAlignedText>
        <RightAlignedText>
          Mint <Italic>{TOKEN_SYMBOL}</Italic> via Form 1.
        </RightAlignedText>
        <BellCurve onTooltip={setTooltipDatum} width={450} height={200} />
        <Text>Figure 1: The minting bonding curve.</Text>
        <Mint />
        <Text>
          Form 1: Mint <Italic>{TOKEN_SYMBOL}</Italic>.
        </Text>
        {/* <Text>
              X (Gas Price): {tooltipDatum?.[0] ?? '-'} GWEI
            </Text>
            <Text>
            Y: ({TOKEN_SYMBOL} minted) {tooltipDatum?.[1] ?? '-'} {TOKEN_SYMBOL}
            </Text> */}

        <TableContainer style={{ marginTop: 48, marginBottom: 20 }}>
          <TableHeader>
            <LabelTableColumn></LabelTableColumn>
            <ValueTableColumn>Value</ValueTableColumn>
          </TableHeader>
          <TableBody>
            <TableRow>
              <LabelTableColumn>Current gas price in gwei</LabelTableColumn>
              <ValueTableColumn>
                {gasInfo.data?.fast.toString() ?? '-'}
              </ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn>Total {TOKEN_SYMBOL} supply</LabelTableColumn>
              <ValueTableColumn>
                {!!totalSupply ? utils.formatEther(totalSupply) : '-'}
              </ValueTableColumn>
            </TableRow>
            <TableRow>
              <LabelTableColumn># of mints at 15.59 gwei</LabelTableColumn>
              <ValueTableColumn>{numMintsAt1559Gwei ?? '-'}</ValueTableColumn>
            </TableRow>
            {account && balance && (
              <TableRow>
                <LabelTableColumn>
                  User ({shortenHexString(account)}) {TOKEN_SYMBOL} balance
                </LabelTableColumn>
                <ValueTableColumn>
                  {utils.formatEther(balance)}
                </ValueTableColumn>
              </TableRow>
            )}
          </TableBody>
        </TableContainer>
        <Text>
          Table 1: Stats on the <Italic>{TOKEN_SYMBOL}</Italic> project.
        </Text>
        <SubTitle style={{ marginTop: 48 }}>Utility</SubTitle>
        <RightAlignedText>
          To be straight, <Italic>{TOKEN_SYMBOL}</Italic> is a meme token. But even with this notion, we do hope to provide some 'utility' to <Italic>{TOKEN_SYMBOL}</Italic> holders by creating an exclusive DAO called:
        </RightAlignedText>
        <RightAlignedText>
          <Bold>{LONDON_EMOJI} <Italic>{TOKEN_SYMBOL}</Italic> Night Club</Bold>
        </RightAlignedText>
        <RightAlignedText>
          The DAO will control a pool of <Italic>{TOKEN_SYMBOL}</Italic> tokens capitalized via a NFT sale (to be described later). <Bold><Italic>{TOKEN_SYMBOL}</Italic> Night Club</Bold> will govern the use of the pool to serve community projects and fund other highly experimentive crypto-experiences.
        </RightAlignedText>
        <RightAlignedText>
          <Bold><Italic>{TOKEN_SYMBOL}</Italic> Night Club</Bold> will be launched post London hardfork.
        </RightAlignedText>
        <RightAlignedText>
          To fund <Bold><Italic>{TOKEN_SYMBOL}</Italic> Night Club</Bold> we will be launching a NFT store called <Bold><Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe</Bold>.
          The <Bold><Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe</Bold> will contain generative mementos of <Italic>{TOKEN_SYMBOL}</Italic> project, each redeemable only with <Italic>{TOKEN_SYMBOL}</Italic>.
        </RightAlignedText> 
        <SubTitle style={{ marginTop: 48 }}>Expectation</SubTitle>
        <RightAlignedText>
          TODO
        </RightAlignedText>
        <SubTitle style={{ marginTop: 48 }}>Appendix: Contract Code</SubTitle>
        <RightAlignedText>
          <A
            href={getEtherscanAddressUrl(deployments[CHAIN_ID].minter)}
            target={'_blank'}
          >
            Minter Contract
          </A>
        </RightAlignedText>
        <MinterCode />
        <RightAlignedText>
          <A
            href={getEtherscanAddressUrl(deployments[CHAIN_ID].erc20)}
            target={'_blank'}
          >
            ERC20 Contract
          </A>
        </RightAlignedText>
        <ERC20Code />
        <MiniText>Omne quod movetur ab alio movetur</MiniText>
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
