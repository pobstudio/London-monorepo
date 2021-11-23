import { FC, useState } from 'react';
import styled from 'styled-components';
import { FlexEnds, Flex } from './flex';
import { Web3Status } from './web3Status';
import { A } from './anchor';
import {
  CHAIN_ID,
  DISCORD_LINK,
  BLOG_LINK,
  TWITTER_LINK,
  UNISWAP_TRADE_LINK,
  OPENSEA_LINK,
  GITHUB_LINK,
  NOTION_WIKI_LINK,
  ADD_LIQUIDITY_LINK,
  TOKEN_SYMBOL,
} from '../constants';
import { deployments } from '@pob/protocol';
import { BREAKPTS } from '../styles';
import { getEtherscanAddressUrl, getEtherscanTokenUrl } from '../utils/urls';
import { ROUTES } from '../constants/routes';
import Link from 'next/link';
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
  > * + * {
    margin-left: 16px;
  }
`;

const AnchorColumn = styled.div`
  a {
    display: block;
  }
  > * + * {
    margin-top: 8px;
  }
`;
const AddressA = styled(A)`
  @media (max-width: ${BREAKPTS.MD}px) {
    display: none;
  }
`;

const DropdownA = styled(A)`
  cursor: pointer;
`;

const DropdownBody = styled.div`
  padding: 8px;
  background: white;
  border: 1px solid black;
  position: absolute;
  left: 0;
  margin-top: 4px;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

export const Header: FC = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <HeaderContainer>
      <HeaderRow>
        <AnchorRow>
          {/* <AddressA
            href={getEtherscanTokenUrl(deployments[CHAIN_ID].erc20)}
            target={'_blank'}
          >
            ERC20
          </AddressA> */}
          {/* <A href={BLOG_LINK} target={'_blank'}>
            Blog
          </A>
          <A href={TWITTER_LINK} target={'_blank'}>
            Twitter
          </A>
          <A href={DISCORD_LINK} target={'_blank'}>
            Discord
          </A> */}
          <Link href={ROUTES.INDEX} passHref>
            <A style={{ fontWeight: 'bold' }}>LONDON</A>
          </Link>
          <A href={NOTION_WIKI_LINK} target={'_blank'}>
            DAO
          </A>
          {/* <Link href={ROUTES.PROVENANCE} passHref>
            <A>Provenance</A>
          </Link> */}
          {/* <Link href={ROUTES.GIFT} passHref>
            <A>Gift</A>
          </Link> */}
          {/* <Link href={ROUTES.PFP} passHref>
            <A>PFP</A>
          </Link> */}
          {/* <Link href={ROUTES.RUG} passHref>
            <A style={{ color: 'blue' }}>Banner</A>
          </Link> */}
          <Link href={ROUTES.BURN} passHref>
            <A>Embers</A>
          </Link>
          <Link href={ROUTES.TOKEN} passHref>
            <A>Token</A>
          </Link>
          <A
            style={{ color: 'blue' }}
            href={UNISWAP_TRADE_LINK}
            target={'_blank'}
          >
            Buy {TOKEN_SYMBOL}
          </A>
          {/* <DropdownContainer>
            <DropdownA onClick={() => setShowMore((s) => !s)}>More</DropdownA>
            {showMore && (
              <DropdownBody>
                <AnchorColumn>
                  <A href={ADD_LIQUIDITY_LINK} target={'_blank'}>
                    Add liquidity
                  </A>
                  <A href={BLOG_LINK} target={'_blank'}>
                    Blog
                  </A>
                </AnchorColumn>
              </DropdownBody>
            )}
          </DropdownContainer> */}
        </AnchorRow>
        <Web3Status />
      </HeaderRow>
    </HeaderContainer>
  );
};
