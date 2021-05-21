import React from 'react';
import { NextPage } from 'next';
import { ContentWrapper } from '../components/content';
import { Header } from '../components/header';
import styled from 'styled-components';
import { Footer } from '../components/footer';
import { BREAKPTS } from '../styles';
import { YourSagaSection } from '../components/saga-hero-section';
import { HashInfoSection } from '../components/hash-info-section';
import { SagaPricingSection } from '../components/saga-pricing-section';
import { HeroContent } from '../components/home-hero';

const IndexPage: NextPage = () => {
  return (
    <ContentWrapper>
      <Header />
      <MainContent>
        <HeroContent />
        <HashInfoSection />
        <YourSagaSection />
        <SagaPricingSection />
      </MainContent>
      <BetweenContentAndFooterSpacer />
      <Footer />
    </ContentWrapper>
  );
};
export default React.memo(IndexPage);

const BetweenContentAndFooterSpacer = styled.div`
  height: 64px;
  width: 100%;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: 32px;
  }
`;

const MainContent = styled.div`
  width: 100%;
`;
