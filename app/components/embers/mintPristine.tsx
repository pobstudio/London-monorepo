import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CHAIN_ID,
  EMBERS_OPENSEA_ASSET_NAME,
  LONDON_EMOJI,
  LONDON_PROD_LINK,
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
  BURN_MAX_PRISTINE_AMOUNT_PER_MINT,
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
import { useIsApproved } from '../../hooks/useIsApproved';
import { useSetApprove } from '../../hooks/useSetApproval';
import { useMintGift } from '../../hooks/useMintGift';
import {
  TableColumn,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
} from '../table';
import { useOpenSeaStats } from '../../hooks/useOpenSea';
import { useEmbersTokenSupply } from '../../hooks/useTokenSupply';
import { useTokensStore } from '../../stores/token';
import { useMintCheck } from '../../hooks/useMintCheck';
import { useLondonEmbersMinterContract } from '../../hooks/useContracts';
import { useTransactionsStore } from '../../stores/transaction';
import { useEmberTxStatus } from '../../hooks/useEmberTxStatus';

const MintWrapper = styled.div`
  border: 1px solid black;
  background: white;
  width: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
    width: 350px;
  }
`;

const Button = styled.button`
  border: none;
  border: 1px solid black;
  background: none;
  color: black;
  background: #f5f5f5;
  text-align: center;
  font-size: 18px;
  line-height: 18px;
  font-weight: 500;
  cursor: pointer;
  padding: 14px 0;
  width: 340px;
  height: 47px;
  text-decoration: underline;
  svg {
    margin-right: 12px;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :hover {
    background: #e5e5e5;
  }
`;

const MintBody = styled.div`
  padding: 14px;
`;

type MintingCardState = 'uninitialized' | 'choose';

type MintingChooseOption =
  | 'current'
  | 'current-little-lower'
  | 'current-more-lower'
  | 'let-wallet-decide'
  | '1559-gwei';

export const PristineMint: FC<{}> = ({}) => {
  return (
    <>
      <MintWrapper>
        <MintContent />
      </MintWrapper>
    </>
  );
};

const MintInput = styled.input`
  background: white;
  padding: 14px;
  border: 1px solid #e5e5e5;
  width: 100%;
  :focus {
    outline: none;
  }
`;

const MintContent: FC = () => {
  const minter = useLondonEmbersMinterContract();
  const tokenSupply = useEmbersTokenSupply('pristine');
  const { account } = useWeb3React();
  const [mintedAmount, setMintedAmount] = useState<number | undefined>(1);
  const tokenBalance = useTokensStore((s) => s.tokenBalance);
  const [safeMintedAmount, setSafeMintedAmount] = useState(1);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);

  const londonNeeded = useMemo(() => {
    return BURN_PRICE_PER_PRISTINE_MINT.mul(safeMintedAmount);
  }, [safeMintedAmount]);

  const isApproved = useIsApproved(londonNeeded);

  const { txStatus: approvalTxStatus, approve } = useSetApprove();

  useEffect(() => {
    if (!!mintedAmount) {
      setSafeMintedAmount(mintedAmount);
    }
  }, [mintedAmount]);

  const isEnoughBalance = useMemo(
    () => tokenBalance.gte(londonNeeded),
    [tokenBalance, londonNeeded],
  );

  const isMintable = useMemo(() => {
    return (
      tokenSupply !== undefined &&
      tokenSupply < BURN_PRISTINE_MINTABLE_SUPPLY &&
      isApproved &&
      isEnoughBalance
    );
  }, [tokenSupply, isApproved, isEnoughBalance]);

  const mintCheck = useMintCheck(
    account ?? undefined,
    'pristine',
    safeMintedAmount,
  );

  const isMintCheckReady = useMemo(() => {
    return !!mintCheck && mintCheck.uris.length == safeMintedAmount;
  }, [mintCheck, safeMintedAmount]);

  const { tx, txStatus } = useEmberTxStatus('pristine');

  const [error, setError] = useState<any | undefined>(undefined);

  const mint = useCallback(async () => {
    if (!account || !minter || !mintCheck) {
      return;
    }
    try {
      const res = await minter.mintPristineType(mintCheck);

      addTransaction(res.hash, {
        tokenType: 'pristine',
        type: 'embers-minting',
      });
      setError(undefined);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [mintCheck, minter, account]);

  const loadingText = useLoadingText();

  const isButtonDisabled = useMemo(() => {
    return (
      !account ||
      !isMintCheckReady ||
      (isApproved && !isMintable) ||
      txStatus === 'in-progress' ||
      approvalTxStatus === 'in-progress'
    );
  }, [
    isMintCheckReady,
    account,
    isApproved,
    isMintable,
    txStatus,
    approvalTxStatus,
  ]);

  const buttonText = useMemo(() => {
    if ((tokenSupply ?? 0) >= BURN_PRISTINE_MINTABLE_SUPPLY) {
      return 'Sold out';
    }
    if (isApproved) {
      if (!isEnoughBalance) {
        return `Not enough ${TOKEN_SYMBOL}`;
      }
      if (!isMintCheckReady) {
        return `Generating art...`;
      }
      if (error || txStatus === 'failed') {
        return 'Oop try again?';
      }
      if (txStatus === 'in-progress') {
        return `Minting...`;
      }
      if (txStatus === 'success') {
        return `Minted`;
      }
      return `Mint for ${safeMintedAmount * 1559} ${TOKEN_SYMBOL}`;
    }
    if (approvalTxStatus === 'failed') {
      return 'Oop try again?';
    }
    if (approvalTxStatus === 'in-progress') {
      return `Approving...`;
    }
    if (approvalTxStatus === 'success') {
      return `Approved`;
    }
    return `Approve ${TOKEN_SYMBOL}`;
  }, [
    error,
    tokenSupply,
    safeMintedAmount,
    isEnoughBalance,
    txStatus,
    isMintCheckReady,
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
        <FlexEnds>
          <Text>
            <Italic>Public sale</Italic>
          </Text>

          <A
            target={'_blank'}
            href={
              !!account
                ? getOpenSeaUserAssetUrl(account, EMBERS_OPENSEA_ASSET_NAME)
                : getOpenSeaCollectionUrl(EMBERS_OPENSEA_ASSET_NAME)
            }
            style={{ cursor: 'pointer' }}
          >
            View on OpenSea
          </A>
        </FlexEnds>
        <FlexEnds style={{ marginTop: 24 }}>
          <Text>
            {BURN_PRISTINE_MINTABLE_SUPPLY - (tokenSupply ?? 0)} /{' '}
            {BURN_PRISTINE_MINTABLE_SUPPLY} EMBERs left
          </Text>
          <Text>
            <Italic>1559 $LONDON each</Italic>
          </Text>
        </FlexEnds>
        <Flex style={{ marginTop: 8 }}>
          <MintInput
            max={BURN_MAX_PRISTINE_AMOUNT_PER_MINT.toString()}
            placeholder={`Choose between 1-${BURN_MAX_PRISTINE_AMOUNT_PER_MINT}`}
            value={mintedAmount}
            type={'number'}
            onChange={(e) =>
              setMintedAmount(
                parseInt(e.target.value) > BURN_MAX_PRISTINE_AMOUNT_PER_MINT
                  ? BURN_MAX_PRISTINE_AMOUNT_PER_MINT
                  : parseInt(e.target.value),
              )
            }
          />
        </Flex>
        <Button
          style={{ width: '100%', marginTop: 14 }}
          disabled={isButtonDisabled}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </MintBody>
    </>
  );
};
