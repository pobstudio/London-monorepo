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
        <IconCircle>
          <Icon src={'/icon.svg'} />
        </IconCircle>
        <Title style={{ marginBottom: 36 }}>
          <Bold>{TOKEN_SYMBOL}</Bold>: A social currency backed by the lasting
          impact of minting, gas price manipulation, and EIP 1559
        </Title>
        <Text>
          <A href={STUDIO_PROD_LINK} target={'_blank'}>
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
          To be straight, <Italic>{TOKEN_SYMBOL}</Italic> is a meme token. But
          even with this notion, we do hope to provide some 'utility' to{' '}
          <Italic>{TOKEN_SYMBOL}</Italic> holders by creating an exclusive DAO
          called:
        </RightAlignedText>
        <RightAlignedText>
          <Bold>
            {LONDON_EMOJI} <Italic>{TOKEN_SYMBOL}</Italic> Night Club
          </Bold>
        </RightAlignedText>
        <RightAlignedText>
          The DAO will control a pool of <Italic>{TOKEN_SYMBOL}</Italic> tokens
          capitalized via a NFT sale (to be described later).{' '}
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
          will be launched post London hardfork.
        </RightAlignedText>
        <RightAlignedText>
          To fund{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Night Club
          </Bold>{' '}
          we will be launching a NFT store called{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe
          </Bold>
          . The{' '}
          <Bold>
            <Italic>{TOKEN_SYMBOL}</Italic> Gift Shoppe
          </Bold>{' '}
          will contain generative mementos of <Italic>{TOKEN_SYMBOL}</Italic>{' '}
          project, each redeemable only with <Italic>{TOKEN_SYMBOL}</Italic>.
        </RightAlignedText>
        <SubTitle style={{ marginTop: 48 }}>Background</SubTitle>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL}</Italic> is a project we been thinking about
          for a while. It all began with our personal fustration with gas
          prices. It is a particularly thorny aspect of interacting with the ETH
          blockchain for both newcomers and veterans alike. Developers building
          Defi work long hours to fight against front running. NFT projects
          create extreme bidding wars as seen with CryptoKitties in 2017 and
          more recently with Artblocks.
        </RightAlignedText>
        <RightAlignedText>
          Gas price has been our way of getting our say in this crypto-future.
          The higher it is, the more signal you put that 'my say' needs to be
          inscribed on the blockchain NOW! The lower it is, the more willing we
          are to relax our FOMO.
        </RightAlignedText>
        <RightAlignedText>
          <Bold>
            Gas price has been our way of getting our say in this crypto-future.
          </Bold>
        </RightAlignedText>
        <RightAlignedText>
          Can we use gas price and its mechanics to say something else? How can
          we manipulate gas markets in ways never before? It became clear that
          this project is more about designing the right 'meme' than a
          technically complex protocol.
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
          15.59 gwei and even get it exactly, people in the future will know of
          <Bold>
            the measurable impact of <Italic>{TOKEN_SYMBOL}</Italic> without
            knowing about the project.
          </Bold>{' '}
          By using gas price as not just a means to an end, but also a form of
          communication, <Italic>{TOKEN_SYMBOL}</Italic> minters will
          demonstrate where our relationship truly lies with gas fee mechanics.
        </RightAlignedText>
        <RightAlignedText>
          <Italic>{TOKEN_SYMBOL}</Italic> is a meme token, but there is some
          subtleness to it. It is backed by our ability to manipulate the gas
          market. It is backed by the number of 15.59 GWEI transactions
          happening during this span of time. It is backed by the rallying cries
          and commentary on crypto-twitter. It is backed by you. It is backed by
          our new understanding of fees exposed by{' '}
          <Italic>{TOKEN_SYMBOL}</Italic>.
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
