import React, { FC } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import {
  CHAIN_ID,
  DUNE_DASHBOARD_LINK,
  LONDON_DAO_TITLE,
  NOTION_WIKI_LINK,
  OPENSEA_ASSET_NAME,
  SNAPSHOT_LINK,
  STUDIO_PROD_LINK,
  TOKEN_SYMBOL,
} from '../constants';
import {
  BLOCK_NUMBER_UNLOCK_START_AT,
  MAX_MINT_NOT_UNLOCKED,
  MAX_MINT_PER_TX,
  MAX_SUPPLY,
} from '../constants/parameters';
import { Header } from '../components/header';
import { NAMES_RARITY_MAP, RARITY, RARITY_TILE_MAP } from '@pob/sketches';
import {
  TableBody,
  TableColumn,
  TableContainer,
  TableHeader,
  TableRow,
} from '../components/table';
import { BREAKPTS } from '../styles';
import { useShopState } from '../hooks/useShopState';
import {
  getEtherscanAddressUrl,
  getOpenSeaAssetUrl,
  getOpenSeaCollectionUrl,
} from '../utils/urls';
import { deployments } from '@pob/protocol';
import { FlexCenter } from '../components/flex';
import { POBIcon } from '../components/icons/pob';
import { MintGift } from '../components/mintGift';
import { ROUTES } from '../constants/routes';
import Link from 'next/link';
import { renderEmbers } from '@pob/sketches';
import { useMemo } from 'react';
import { useRef } from 'react';
import { useFirstMountState } from 'react-use';
import { useIsMounted } from '../hooks/useIsMounted';
import { decodeValue, encodeValue } from '../utils/base64';

const PageWrapper = styled.div`
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

const TestPage: NextPage = () => {
  const isMounted = useIsMounted();

  const svgBuffer = useMemo(() => {
    if (!isMounted) {
      return '';
    }
    const svg = renderEmbers();
    return decodeValue(svg);
  }, [isMounted]);

  return (
    <>
      <Header />
      <PageWrapper>
        <img src={`data:image/svg+xml;base64,${svgBuffer}`} alt="" />
      </PageWrapper>
    </>
  );
};

export default React.memo(TestPage);
