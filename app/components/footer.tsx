import { FC } from 'react';
import { FlexEnds, Flex } from './flex';
import { POBIcon } from './icons/pob';
import { Bold, MiniText, Text } from './text';
import styled from 'styled-components';
import {
  DISCORD_LINK,
  GITHUB_LINK,
  OPENSEA_LINK,
  TWITTER_LINK,
} from '../constants';
import { A } from './anchor';
import { BREAKPTS } from '../styles';

const FooterRow = styled(FlexEnds)`
  width: 800px;
  padding: 48px 0;
  align-items: flex-start;
  @media (max-width: ${BREAKPTS.MD}px) {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
`;

const AnchorColumn = styled(Flex)`
  a {
    display: block;
  }
  > * + * {
    margin-left: 12px;
  }
  @media (max-width: ${BREAKPTS.MD}px) {
    margin-top: 12px;
  }
`;

export const Footer: FC = () => {
  return (
    <FooterRow>
      <POBIcon />
      <AnchorColumn>
        <A href={DISCORD_LINK} target={'_blank'}>
          Discord
        </A>
        <A href={OPENSEA_LINK} target={'_blank'}>
          OpenSea
        </A>
        <A href={GITHUB_LINK} target={'_blank'}>
          Github
        </A>
        <A href={TWITTER_LINK} target={'_blank'}>
          Twitter
        </A>
      </AnchorColumn>
    </FooterRow>
  );
};
