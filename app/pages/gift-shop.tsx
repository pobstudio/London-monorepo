import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { BellCurve } from '../components/bellCurve';
import { Countdown } from '../components/countdown';
import { Text, Bold, MiniText } from '../components/text';
import { A } from '../components/anchor';
import { TOKEN_SYMBOL } from '../constants';
import { BLOCK_NUMBER_UP_TO } from '../constants/parameters';
import { Header } from '../components/header';

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
  justify-content: center;
  min-height: 100vh;
`;

const Content = styled.div`
  margin-top: 24px;
  width: 450px;
  p + p {
    margin-top: 24px;
  }
`;

const GiftShopPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        <Content>
          <Text>
            <Bold>Coming soon</Bold>
          </Text>
          <Text>
            Unique NFTs celebrating EIP 1559. Each cost 1559 {TOKEN_SYMBOL}
          </Text>
        </Content>
      </PageWrapper>
    </>
  );
};

export default React.memo(GiftShopPage);
