import React, { FC, useEffect, useMemo, useState } from 'react';
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
  BLOCK_NUMBER_REVEAL_START_AT,
  BLOCK_NUMBER_UNLOCK_START_AT,
  BLOCK_NUMBER_UP_TO,
  MAX_MINT_NOT_UNLOCKED,
  MAX_MINT_PER_TX,
  MAX_SUPPLY,
  MINT_PRICE,
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
import { TableColumn, TableContainer, TableHeader, TableBody, TableRow } from './table';
import { useOpenSeaStats } from '../hooks/useOpenSea';

const LabelTableColumn = styled(TableColumn)`
  width: 320px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 220px;
  }
`;

const ValueTableColumn = styled(TableColumn)`
  text-align: right;
`;

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

export const MintGift: FC<{}> = ({}) => {
  const shopState = useShopState();
  return (
    <>
      <MintWrapper>
        {shopState === 'not-open' && <NotOpenMintContent />}
        {shopState === 'open' && <MintContent />}
        {shopState === 'revealed' && <MintContent />}
        {shopState === 'preview' && <PreviewMintContent />}
        {shopState === 'sold-out' && <SoldOutMintContent />}
      </MintWrapper>
      <OpenSeaStats />
    </>
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

export const OpenSeaStats = () => {
  const {
    total_volume,
    floor_price,
    num_owners,
    avg_price,
    market_cap,
  } = useOpenSeaStats();
  return (
    <TableContainer
      style={{
        marginTop: 48,
        marginBottom: 20,
        border: '1px solid black',
        background: 'white',
      }}
    >
      <TableHeader>
        <LabelTableColumn>OpenSea Stats</LabelTableColumn>
        <ValueTableColumn>Value</ValueTableColumn>
      </TableHeader>
      <TableBody>
        <TableRow>
          <LabelTableColumn>Total Volume</LabelTableColumn>
          <ValueTableColumn>{total_volume?.toFixed(2)} ETH</ValueTableColumn>
        </TableRow>
        <TableRow>
          <LabelTableColumn>Floor Price</LabelTableColumn>
          <ValueTableColumn>{floor_price?.toFixed(2)} ETH</ValueTableColumn>
        </TableRow>
        <TableRow>
          <LabelTableColumn>Avg Price</LabelTableColumn>
          <ValueTableColumn>{avg_price?.toFixed(2)} ETH</ValueTableColumn>
        </TableRow>
        <TableRow>
          <LabelTableColumn>Owners</LabelTableColumn>
          <ValueTableColumn>{num_owners?.toFixed(0)} wallets</ValueTableColumn>
        </TableRow>
        <TableRow>
          <LabelTableColumn>Market Cap</LabelTableColumn>
          <ValueTableColumn>{market_cap?.toFixed(2)} ETH</ValueTableColumn>
        </TableRow>
      </TableBody>
    </TableContainer>
  );
};

const MintInput = styled.input`
  background: none;
  border: none;
  outline: none;
  width: 100%;
  text-align: center;
  border-top: 1px solid black;
  padding: 6px;
  font-size: 18px;
  margin: 0;
`;

const MintContent: FC = () => {
  const tokenIndex = useGiftStore((s) => s.tokenIndex);
  const { account } = useWeb3React();
  const isApproved = useIsApproved();

  const { txStatus: approvalTxStatus, approve } = useSetApprove();

  const [mintedAmount, setMintedAmount] = useState<number | undefined>(1);

  const [safeMintedAmount, setSafeMintedAmount] = useState(1);

  useEffect(() => {
    if (!!mintedAmount) {
      setSafeMintedAmount(mintedAmount);
    }
  }, [mintedAmount]);
  const {
    txStatus: mintingTxStatus,
    mint,
    isMintable,
    isEnoughBalance,
  } = useMintGift(safeMintedAmount);

  const loadingText = useLoadingText();

  const isButtonDisabled = useMemo(() => {
    return (
      !account ||
      (isApproved && !isMintable) ||
      mintingTxStatus === 'in-progress' ||
      approvalTxStatus === 'in-progress'
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
        return `Success, mint again for ${
          safeMintedAmount * 1559
        } ${TOKEN_SYMBOL}?`;
      }
      return `Mint for ${safeMintedAmount * 1559} ${TOKEN_SYMBOL}`;
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
    safeMintedAmount,
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
      <MintInput
        max={MAX_MINT_PER_TX.toString()}
        placeholder={`Choose between 1-${MAX_MINT_PER_TX}`}
        value={mintedAmount}
        type={'number'}
        onChange={(e) =>
          setMintedAmount(
            parseInt(e.target.value) > MAX_MINT_PER_TX
              ? MAX_MINT_PER_TX
              : parseInt(e.target.value),
          )
        }
      />
      <Button disabled={isButtonDisabled} onClick={onButtonClick}>
        {mintingTxStatus === 'in-progress' || approvalTxStatus === 'in-progress'
          ? loadingText + ' '
          : ''}
        {buttonText}
      </Button>
    </>
  );
};

const PreviewMintContent: FC = () => {
  const tokenIndex = useGiftStore((s) => s.tokenIndex);
  const { account } = useWeb3React();
  const isApproved = useIsApproved();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const mintedAmount = useGiftStore((s) => s.nftMintedAmount);
  const { txStatus: approvalTxStatus, approve } = useSetApprove();

  const {
    txStatus: mintingTxStatus,
    mint,
    isMintable,
    isEnoughBalance,
  } = useMintGift(MAX_MINT_NOT_UNLOCKED);

  const loadingText = useLoadingText();

  const isButtonDisabled = useMemo(() => {
    return (
      !account ||
      (isApproved && !isMintable) ||
      mintingTxStatus === 'in-progress' ||
      approvalTxStatus === 'in-progress'
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
        return `Success, wait ${
          blockNumber ? BLOCK_NUMBER_UNLOCK_START_AT - blockNumber : '-'
        } to mint more.`;
      }
      return `Mint`;
    }
    if (mintedAmount >= MAX_MINT_NOT_UNLOCKED) {
      return `Minted, wait ${
        blockNumber ? BLOCK_NUMBER_UNLOCK_START_AT - blockNumber : '-'
      } to mint more.`;
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
    blockNumber,
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
