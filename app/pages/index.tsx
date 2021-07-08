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
  STUDIO_PROD_LINK,
  TOKEN_SYMBOL,
} from '../constants';
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
  background: #fafafa;
  padding: 12px;
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
  const [pageWrapperRef, { width }] = useMeasure();

  const graphWidth = useMemo(() => (width > 450 ? 450 : width), [width]);

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
        <Caption style={{ marginBottom: 12 }}>
          A social currency backed by the lasting impact of minting, gas price
          manipulation, and EIP 1559
        </Caption>
        <Text style={{ marginBottom: 36 }}>
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
          <Italic>{TOKEN_SYMBOL}</Italic> is an{' '}
          <A
            href={getEtherscanAddressUrl(deployments[CHAIN_ID].erc20)}
            target={'_blank'}
          >
            ERC20
          </A>{' '}
          where the amount of tokens minted is directly tied to gas price via a
          bonding curve (See Figure 1). The bonding curve doesn't reward gas
          bidding wars; users will need to coordinate in new ways to optimize
          their <Italic>{TOKEN_SYMBOL}</Italic> returns.
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
          radically changes the fee market mechanics.{' '}
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
          is a celebration and critique of our relationship with miners and core
          developers. Join the movement, each <Italic>{TOKEN_SYMBOL}</Italic> is
          a memento of your part in this experience.
        </RightAlignedText>
        <RightAlignedText>
          Mint <Italic>{TOKEN_SYMBOL}</Italic> via the bonding curve below. Max
          output @ 15.59 gwei.
        </RightAlignedText>
        <BellCurve
          onTooltip={setTooltipDatum}
          width={graphWidth}
          height={200}
        />

        <CoreMinting>
          <CoreMintingInner>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <Text style={{ marginBottom: 20 }}>
                <strong>
                  Play <Italic>{TOKEN_SYMBOL}</Italic>
                </strong>
              </Text>
              <Mint />
            </div>

            <TableContainer
              style={{
                marginTop: 48,
                marginBottom: 20,
                border: '1px solid black',
              }}
            >
              <TableHeader>
                <LabelTableColumn>Stats</LabelTableColumn>
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
                  <LabelTableColumn>
                    Total {TOKEN_SYMBOL} supply
                  </LabelTableColumn>
                  <ValueTableColumn>
                    {!!totalSupply ? utils.formatEther(totalSupply) : '-'}
                  </ValueTableColumn>
                </TableRow>
                <TableRow>
                  <LabelTableColumn>
                    Lowest gas price used in gwei
                  </LabelTableColumn>
                  <ValueTableColumn>
                    {!!lowestGasPriceMinted
                      ? utils.formatUnits(lowestGasPriceMinted, 'gwei')
                      : '-'}
                  </ValueTableColumn>
                </TableRow>
                <TableRow>
                  <LabelTableColumn># of mints at 15.59 gwei</LabelTableColumn>
                  <ValueTableColumn>
                    {numMintsAt1559Gwei ?? '-'}
                  </ValueTableColumn>
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
          </CoreMintingInner>
        </CoreMinting>

        <SubTitle style={{ marginTop: 48 }}>Utility</SubTitle>
        <RightAlignedText>
          We will be launching a NFT store called{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe
          </Bold>
          . The{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe
          </Bold>{' '}
          will contain 1559 generative mementos of the{' '}
          <Italic>{TOKEN_SYMBOL}</Italic> project, each only redeemable with{' '}
          <Italic>{TOKEN_SYMBOL}</Italic>.
        </RightAlignedText>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL}</Italic> holders will be participants in the
        </RightAlignedText>
        <RightAlignedText>
          <Bold>
            {LONDON_EMOJI} <Italic>{TOKEN_SYMBOL}</Italic> Night Club
          </Bold>
        </RightAlignedText>
        <RightAlignedText>
          The DAO will control a pool of <Italic>{TOKEN_SYMBOL}</Italic> tokens
          capitalized via the proceeds from{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe
          </Bold>
          .{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Night Club
          </Bold>{' '}
          will govern the use of the pool to serve community projects and fund
          other highly experimentive crypto-experiences.
        </RightAlignedText>
        <RightAlignedText>
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Night Club
          </Bold>{' '}
          +{' '}
          <Bold>
            {' '}
            <Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe
          </Bold>{' '}
          will be launched post London hardfork.
        </RightAlignedText>
        <SubTitle style={{ marginTop: 48 }}>Background</SubTitle>
        <RightAlignedText>
          <Bold>Gas price is how we get our say in this crypto-future.</Bold>
        </RightAlignedText>
        <RightAlignedText>
          Can we use gas price and its mechanics to say something we never have
          before? How can we manipulate gas markets in ways never before?
        </RightAlignedText>
        <RightAlignedText>
          With the stars aligning, the London hardfork + EIP 1559 provides a
          perfect 'meme' for this project. EIP 1559 fundamentally changes gas
          price mechanics, so what better thing to create a project about gas
          prices around? We also wanted the project to 'expire' to not
          needlessly clog the mempool with transactions, the hardfork became the
          perfect 'epxiry' date.
        </RightAlignedText>
        <RightAlignedText>
          This is why the bonding curve (a bell curve) is centered at precisely
          15.59 gwei in homage to EIP 1559 and your maximum returns is 1559{' '}
          <Italic>{TOKEN_SYMBOL}</Italic>. As people mint closer and closer to
          15.59 gwei and even get it exactly, people in the future will know of{' '}
          <Bold>
            the measurable impact of <Italic>{TOKEN_SYMBOL}</Italic> without
            knowing about the project.
          </Bold>{' '}
        </RightAlignedText>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL}</Italic> is a meme token. It is backed by our
          ability to manipulate the gas market. It is backed by the number of
          15.59 GWEI transactions happening during this span of time. It is
          backed by the rallying cries and commentary on crypto-twitter. It is
          backed by you. By using gas price as not just a means to an end, but
          also a form of communication, <Italic>{TOKEN_SYMBOL}</Italic> minters
          will demonstrate where our relationship truly lies with gas fee
          mechanics.
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
            href={getEtherscanTokenUrl(deployments[CHAIN_ID].erc20)}
            target={'_blank'}
          >
            ERC20 Contract
          </A>
        </RightAlignedText>
        <ERC20Code />
        <MiniText>Omne quod movetur ab alio movetur</MiniText>
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
