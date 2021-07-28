import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CHAIN_ID,
  LONDON_EMOJI,
  LONDON_PROD_LINK,
  ONE_GWEI,
  OPENSEA_ASSET_NAME,
  TOKEN_SYMBOL,
  TWITTER_LINK,
} from '../constants';
import { useMinter } from '../hooks/useMinter';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useLoadingText } from '../hooks/useLoadingText';
import {
  BELL_CURVE_C,
  BLOCK_NUMBER_UP_TO,
  MAX_SUPPLY,
} from '../constants/parameters';
import { BigNumber } from '@ethersproject/bignumber';
import { utils } from 'ethers';
import { A } from './anchor';
import { FlexCenter, FlexCenterColumn, FlexEnds } from './flex';
import { ASpan, Bold, Text, Title } from './text';
import { useBlockchainStore } from '../stores/blockchain';
import { useGasInfo } from '../hooks/useGasInfo';
import { getTwitterShareLink } from '../utils/twitter';
import { BREAKPTS } from '../styles';
import { useShopState } from '../hooks/useShopState';
import {
  getOpenSeaAssetUrl,
  getOpenSeaCollectionUrl,
  getOpenSeaUserAssetUrl,
} from '../utils/urls';
import { deployments } from '@pob/protocol';
import { ROUTES } from '../constants/routes';
import { useGiftStore } from '../stores/gift';
import { useIsApproved } from '../hooks/useIsApproved';
import { useSetApprove } from '../hooks/useSetApproval';
import { useMintGift } from '../hooks/useMintGift';
const MintWrapper = styled.div`
  border: 1px solid black;
  background: white;
  width: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
  }
`;

const Button = styled.button`
  border: none;
  border-top: 1px solid black;
  width: 100%;
  background: none;
  color: black;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px;
  text-decoration: underline;
  svg {
    margin-right: 12px;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :hover {
    background: #f6f6f6;
  }
`;

const MintBody = styled.div`
  padding: 8px;
`;

type MintingCardState = 'uninitialized' | 'choose';

type MintingChooseOption =
  | 'current'
  | 'current-little-lower'
  | 'current-more-lower'
  | 'let-wallet-decide'
  | '1559-gwei';

const LITTLE_LOWER_DELTA = 10;
const MORE_LOWER_DELTA = 20;

const MintOptionRow = styled(FlexEnds)``;

const MintOptionRowContainer = styled.div`
  padding: 8px 0;
`;

export const MintGift: FC<{}> = ({}) => {
  const shopState = useShopState();
  return (
    <MintWrapper>
      {shopState === 'not-open' && <NotOpenMintContent />}
      {shopState === 'open' && <MintContent />}
      {shopState === 'sold-out' && <SoldOutMintContent />}
    </MintWrapper>
  );
};

const NotOpenMintContent: FC = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  return (
    <>
      <MintBody>
        <FlexCenterColumn style={{ margin: '36px 0' }}>
          <Title>
            <Bold>{blocksLeft ?? '-'}</Bold>
          </Title>
          <Text>Blocks left until grand opening</Text>
        </FlexCenterColumn>
        <FlexCenterColumn>
          <A
            target={'_blank'}
            href={getTwitterShareLink(LONDON_PROD_LINK, `${LONDON_EMOJI}`)}
            style={{ cursor: 'pointer' }}
          >
            Tweet {LONDON_EMOJI}
          </A>
        </FlexCenterColumn>
      </MintBody>
      <Button as={'a'} style={{ display: 'block' }} href={ROUTES.INDEX}>
        Go stack some $LONDON!
      </Button>
    </>
  );
};

const SoldOutMintContent: FC = () => {
  return (
    <>
      <MintBody>
        <FlexCenterColumn style={{ margin: '36px 0' }}>
          <Title>
            <Bold>SOLD OUT</Bold>
          </Title>
          <Text>All {MAX_SUPPLY} gifts have been minted</Text>
        </FlexCenterColumn>
        {/* <FlexCenterColumn>
          <A
            target={'_blank'}
            href={TWITTER_LINK}
            style={{ cursor: 'pointer' }}
          >
            Follow for updates
          </A>
        </FlexCenterColumn> */}
      </MintBody>
      <Button
        as={'a'}
        style={{ display: 'block' }}
        href={getOpenSeaCollectionUrl(OPENSEA_ASSET_NAME)}
        target={'_blank'}
      >
        Head to OpenSea
      </Button>
    </>
  );
};

const MintContent: FC = () => {
  const tokenIndex = useGiftStore((s) => s.tokenIndex);
  const { account } = useWeb3React();
  const isApproved = useIsApproved();

  const { txStatus: approvalTxStatus, approve } = useSetApprove();
  const {
    txStatus: mintingTxStatus,
    mint,
    isMintable,
    isEnoughBalance,
  } = useMintGift();

  const loadingText = useLoadingText();

  const isButtonDisabled = useMemo(() => {
    return (
      !account ||
      (isApproved && !isMintable) ||
      mintingTxStatus === 'in-progress' ||
      approvalTxStatus === 'in-progress' ||
      approvalTxStatus === 'success'
    );
  }, [account, isApproved, isMintable, mintingTxStatus, approvalTxStatus]);

  const buttonText = useMemo(() => {
    if (isApproved) {
      if (!isEnoughBalance) {
        return `Not enough ${TOKEN_SYMBOL}`;
      }
      if (mintingTxStatus === 'failed') {
        return 'Oop try again?';
      }
      if (mintingTxStatus === 'in-progress') {
        return ``;
      }
      if (mintingTxStatus === 'success') {
        return `Success, mint again?`;
      }
      return 'Mint';
    }
    if (approvalTxStatus === 'failed') {
      return 'Oop try again?';
    }
    if (approvalTxStatus === 'in-progress') {
      return ``;
    }
    if (approvalTxStatus === 'success') {
      return `Approved`;
    }
    return `Approve ${TOKEN_SYMBOL}`;
  }, [
    isEnoughBalance,
    mintingTxStatus,
    loadingText,
    isApproved,
    approvalTxStatus,
  ]);

  const onButtonClick = useCallback(() => {
    if (isApproved) {
      mint();
    } else {
      approve();
    }
  }, [mint, approve, isApproved]);

  return (
    <>
      <MintBody>
        <FlexCenterColumn style={{ margin: '36px 0' }}>
          <Title>
            <Bold>
              {MAX_SUPPLY - tokenIndex} / {MAX_SUPPLY}
            </Bold>
          </Title>
          <Text>gifts left</Text>
        </FlexCenterColumn>
        <FlexCenterColumn>
          <A
            target={'_blank'}
            href={
              !!account
                ? getOpenSeaUserAssetUrl(account, OPENSEA_ASSET_NAME)
                : getOpenSeaCollectionUrl(OPENSEA_ASSET_NAME)
            }
            style={{ cursor: 'pointer' }}
          >
            View collection on OpenSea
          </A>
        </FlexCenterColumn>
      </MintBody>
      <Button disabled={isButtonDisabled} onClick={onButtonClick}>
        {mintingTxStatus === 'in-progress' || approvalTxStatus === 'in-progress'
          ? loadingText + ' '
          : ''}
        {buttonText}
      </Button>
    </>
  );
};

export const MintButton: FC<{ gasPriceInWei?: BigNumber }> = ({
  gasPriceInWei,
}) => {
  const { account } = useWeb3React();
  const { txStatus, mint, error } = useMinter();

  const buttonText = useMemo(() => {
    if (!account) {
      return 'PLUG URSELF IN';
    }
    if (!!error || txStatus === 'failed') {
      if (!!gasPriceInWei) {
        return `OOF. TRY AGAIN AT ${utils.formatUnits(
          gasPriceInWei,
          'gwei',
        )} GWEI`;
      }
      return 'OOF. TRY AGAIN';
    }
    if (txStatus === 'in-progress') {
      return '';
    }
    if (txStatus === 'success') {
      return 'MINTED';
    }
    if (!!gasPriceInWei) {
      return `MINT AT ${utils.formatUnits(gasPriceInWei, 'gwei')} GWEI`;
    }
    return `MINT`;
  }, [gasPriceInWei, txStatus, error, account]);

  const isDisabled = useMemo(() => {
    return !account || txStatus === 'in-progress' || txStatus === 'success';
  }, [account, txStatus]);

  const onClick = useCallback(() => {
    mint(gasPriceInWei);
  }, [mint, gasPriceInWei]);

  const loadingText = useLoadingText();

  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  return (
    <Button onClick={onClick} disabled={isDisabled}>
      {txStatus === 'in-progress' ? loadingText + ' ' : ''}
      {buttonText}
    </Button>
  );
};
