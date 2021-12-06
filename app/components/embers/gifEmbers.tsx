import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CHAIN_ID,
  EMBERS_OPENSEA_ASSET_NAME,
  LONDON_EMOJI,
  LONDON_PROD_LINK,
  NULL_ADDRESS,
  ONE_GWEI,
  OPENSEA_ASSET_NAME,
  TOKEN_SYMBOL,
  TWITTER_LINK,
} from '../../constants';
import { useMinter } from '../../hooks/useMinter';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useLoadingText } from '../../hooks/useLoadingText';
import {
  BELL_CURVE_C,
  BLOCK_NUMBER_REVEAL_START_AT,
  BLOCK_NUMBER_UNLOCK_START_AT,
  BLOCK_NUMBER_UP_TO,
  BURN_EMBERS_AMOUNT_TO_EMBERS,
  BURN_GIFT_AMOUNT_TO_EMBERS,
  BURN_LONDON_FEE_FOR_GIFTS,
  BURN_LONDON_FEE_FOR_SELF,
  BURN_MAX_AMOUNT_GIFTS,
  BURN_MAX_PRISTINE_AMOUNT_PER_MINT,
  BURN_MIN_MAX_AMOUNT_FOR_GIFTS,
  BURN_MIN_MAX_AMOUNT_FOR_SELF,
  BURN_PRICE_PER_PRISTINE_MINT,
  BURN_PRISTINE_MINTABLE_SUPPLY,
  MAX_MINT_NOT_UNLOCKED,
  MAX_MINT_PER_TX,
  MAX_SUPPLY,
  MINT_PRICE,
} from '../../constants/parameters';
import { BigNumber } from '@ethersproject/bignumber';
import { utils } from 'ethers';
import { A } from '../anchor';
import { Flex, FlexCenter, FlexCenterColumn, FlexEnds } from '../flex';
import { ASpan, Bold, Italic, Text, Title } from '../text';
import { useBlockchainStore } from '../../stores/blockchain';
import { useGasInfo } from '../../hooks/useGasInfo';
import { getTwitterShareLink } from '../../utils/twitter';
import { BREAKPTS } from '../../styles';
import { useShopState } from '../../hooks/useShopState';
import {
  getOpenSeaAssetUrl,
  getOpenSeaCollectionUrl,
  getOpenSeaUserAssetUrl,
} from '../../utils/urls';
import { deployments } from '@pob/protocol';
import { ROUTES } from '../../constants/routes';
import { useGiftStore } from '../../stores/gift';
import {
  useGiftAndEmbersIsApproved,
  useIsApproved,
} from '../../hooks/useIsApproved';
import { useSetApprove, useSetNFTApprove } from '../../hooks/useSetApproval';
import { useMintGift } from '../../hooks/useMintGift';
import {
  TableColumn,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
} from '../table';
import {
  OPENSEA_ASSET,
  OPENSEA_COLLECTION,
  useLondonAssets,
} from '../../hooks/useOpenSea';
import { useEmbersTokenSupply } from '../../hooks/useTokenSupply';
import { useTokensStore } from '../../stores/token';
import { useMintCheck } from '../../hooks/useMintCheck';
import { useLondonEmbersMinterContract } from '../../hooks/useContracts';
import { useTransactionsStore } from '../../stores/transaction';
import { useEmberTxStatus } from '../../hooks/useEmberTxStatus';
import { findIndex } from 'lodash';
import { useEthPriceOfLondon } from '../../hooks/useEthPriceOfLondon';
import { useGiftBurned } from '../../hooks/useGiftBurned';

const MintWrapper = styled.div`
  border: 1px solid black;
  background: white;
  width: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
    width: 350px;
  }
  position: relative;
`;

const MintBody = styled.div`
  padding: 14px;
`;

export const GifEmbers: FC<{}> = ({}) => {
  return (
    <>
      <MintWrapper>
        <GifContent />
      </MintWrapper>
    </>
  );
};

const GifContent: FC = () => {
  const { account } = useWeb3React();

  const londonAssets = useLondonAssets(account ?? NULL_ADDRESS);
  const selectedCollection = useMemo(() => {
    return londonAssets.find(
      (i) => i.contract === deployments[CHAIN_ID].embers,
    );
  }, [londonAssets]);

  const assets = useMemo(
    () => selectedCollection?.assets,
    [selectedCollection],
  );

  return (
    <>
      <MintBody>
        <FlexEnds>
          <Text>
            <Italic>Click to download gif: </Italic>
          </Text>
        </FlexEnds>
        {!assets || assets.length === 0 || !selectedCollection ? (
          <EmptyCollectionContainer>
            <Text style={{ opacity: 0.5 }}>Do not own any.</Text>
          </EmptyCollectionContainer>
        ) : (
          <CollectionBody>
            {assets.map((asset: OPENSEA_ASSET) => (
              <Asset
                as={'a'}
                download
                href={`/api/gif-embers?tokenId=${asset.id}`}
                key={`asset-${asset.name}`}
              >
                <img src={asset.image} />
              </Asset>
            ))}
          </CollectionBody>
        )}
        <Text style={{ marginTop: 14 }}>Will take a few seconds to load</Text>
      </MintBody>
    </>
  );
};

const UserSectionContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

const CollectionBody = styled.div<{ isVerticalScroll?: boolean }>`
  display: grid;
  padding: 14px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 14px;
  overflow: auto;
  margin: 0;
  margin-top: 14px;
  max-height: 360px;
  background: #f6f6f6;
`;

const EmptyCollectionContainer = styled(FlexCenter)`
  background: #f6f6f6;
  height: 360px;
  width: 100%;
  margin-top: 14px;
`;

const Asset = styled.div<{ isSelected?: boolean }>`
  box-sizing: border-box;
  border: ${(p) => (p.isSelected ? '8px solid black' : 'none')};
  background: white;
  img {
    display: block;
    height: 100%;
    width: 100%;
  }
`;
