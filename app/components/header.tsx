import { FC } from 'react';
import styled from 'styled-components';
import { FlexEnds, Flex } from './flex';
import { Web3Status } from './web3Status';
import { A } from './anchor';
import {
  CHAIN_ID,
  DISCORD_LINK,
  LONDON_EMOJI,
  TWITTER_LINK,
} from '../constants';
import { deployments } from '@pob/protocol';
import { BREAKPTS } from '../styles';
import { getEtherscanAddressUrl, getEtherscanTokenUrl } from '../utils/urls';

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

const AddressA = styled(A)`
  @media (max-width: ${BREAKPTS.MD}px) {
    display: none;
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
          <AddressA href={getEtherscanTokenUrl(deployments[CHAIN_ID].erc20)} target={'_blank'}>ERC20: {deployments[CHAIN_ID].erc20}</AddressA>
        </AnchorRow>
        <Web3Status />
      </HeaderRow>
    </HeaderContainer>
  );
};
