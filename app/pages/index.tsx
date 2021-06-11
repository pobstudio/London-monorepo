import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { BellCurve } from '../components/bellCurve';
import { Countdown } from '../components/countdown';
import { Text, Bold, MiniText } from '../components/text';
import { A } from '../components/anchor';
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
  margin-top: 24px;
  width: 450px;
  p + p {
    margin-top: 24px;
  }
`;

const Spacer = styled.div`
  width: 100%;
  height: 120px;
`;

const IndexPage: NextPage = () => {
  return (
    <PageWrapper>
      <Content>
        <Text>
          <a style={{color: 'white', textDecoration: 'underline'}}>{TOKEN_SYMBOL}</a>
        </Text>
      </Content>
    </PageWrapper>
    // <PageWrapper>
    //   <Spacer />
    //   <Countdown />
    //   <BellCurve width={800} height={160} />
    //   <Content>
    //     <Text>
    //       <Bold>15.59 GWEI</Bold>
    //     </Text>
    //     <Text>
    //       {TOKEN_SYMBOL} is a social currency backed by the lasting impact of this moment in time.
    //     </Text>
    //     <Text>
    //       After {TOKEN_SYMBOL} hardfork, no more {TOKEN_SYMBOL} will EVER be created.
    //     </Text>
    //     <Text>
    //       You got until block num {BLOCK_NUMBER_UP_TO.toLocaleString()}.
    //     </Text>
    //     <Text>
    //       FAIR LAUNCH, <Bold>NO STARTING SUPPLY.</Bold>
    //     </Text>
    //     <Text>Work together, collude, or manipulate.</Text>
    //     <Text>
    //       GL. Try to get <Bold>15.59 GWEI</Bold>. <a style={{color: 'white', textDecoration: 'underline'}}>Learn More</a>
    //     </Text>
    //   </Content>
    //   <Content style={{marginTop: 32}}>
    //     <MiniText>
    //       Omne quod movetur ab alio movetur
    //     </MiniText>
    //   </Content>
    //   <Content style={{marginTop: 32}}>
    //     <AnchorList>
    //       <A>{TOKEN_SYMBOL} GIFT SHOP</A>
    //       <A>{TOKEN_SYMBOL} NIGHT CLUB DAO</A>
    //       <A>Trade</A>
    //       <A>Discord</A>
    //       <A>Twitter</A>
    //     </AnchorList>
    //   </Content>
    // </PageWrapper>
  );
};

const AnchorList = styled.div`
  > a {
    display: block;
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
