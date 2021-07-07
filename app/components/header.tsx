import { FC } from 'react';
import styled from 'styled-components';
import { FlexEnds, Flex } from './flex';
import { Web3Status } from './web3Status';
import { A } from './anchor';
import { DISCORD_LINK, LONDON_EMOJI, TWITTER_LINK } from '../constants';

const HeaderContainer = styled.div`
  /* padding: 0 12px; */
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  background: white;
  z-index: 100;
  border-bottom: 1px solid black;
`;

const HeaderRow = styled(FlexEnds)`
  padding: 4px 12px;
`;

const AnchorRow = styled(Flex)`
  a + a {
    margin-left: 16px;
  }
`;

export const Header: FC = () => {
  return (
    <HeaderContainer>
      <HeaderRow>
        <AnchorRow>
          <A href={TWITTER_LINK} target={'_blank'}>
            Twitter
          </A>
          <A href={DISCORD_LINK} target={'_blank'}>
            Discord
          </A>
        </AnchorRow>
        <Web3Status />
      </HeaderRow>
    </HeaderContainer>
  );
};
