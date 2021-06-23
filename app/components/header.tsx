import { FC } from 'react';
import styled from 'styled-components';
import { FlexEnds, Flex } from './flex';
import { Web3Status } from './web3Status';
import { A } from './anchor';
import { LONDON_EMOJI } from '../constants';

const HeaderContainer = styled.div`
  padding: 0 12px;
`;

const HeaderRow = styled(FlexEnds)`
  padding: 4px 0;
  border-bottom: 2px solid black;
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
          <A>Twitter</A>
          <A>Discord</A>
        </AnchorRow>
        <Web3Status />
      </HeaderRow>
    </HeaderContainer>
  );
};
