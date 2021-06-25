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
        {/* <IconCircle>
          <Icon src={'/icon.svg'} />
        </IconCircle> */}
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
        <Text>
          Coming soon.
        </Text>
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
