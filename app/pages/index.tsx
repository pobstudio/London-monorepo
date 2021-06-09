import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { BellCurve } from '../components/bellCurve';
import { Countdown } from '../components/countdown';
import { Text, Bold } from '../components/text';
import { TOKEN_SYMBOL } from '../constants';
import { BLOCK_NUMBER_UP_TO } from '../constants/parameters';

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
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const Content = styled.div`
  width: 350px;
  p + p {
    margin-top: 16px;
  }
`;

const Spacer = styled.div`
  width: 100%;
  height: 120px;
`;

const IndexPage: NextPage = () => {
  return (
    <PageWrapper>
      <Spacer />
      <Countdown />
      <BellCurve width={600} height={160} />
      <Content>
        <Text>
          <Bold>15.59 GWEI</Bold>
        </Text>
        <Text>
          {TOKEN_SYMBOL} IS A SOCIAL CURRENCY. BACKED BY THE LASTING IMPACT OF
          THIS MOMENT IN TIME.
        </Text>
        <Text>
          After $London hardfork, no more $LONDON will EVER be created. You got
          til block num {BLOCK_NUMBER_UP_TO.toLocaleString()}.
        </Text>
        <Text>
          FAIR LAUNCH, <Bold>NO STARTING SUPPLY.</Bold>
        </Text>
        <Text>WORK TOGETHER, COLLUDE, OR MANIPULATE.</Text>
        <Text>
          GL. TRY TO GET <Bold>15.59 GWEI</Bold>
        </Text>
      </Content>
    </PageWrapper>
  );
};
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
