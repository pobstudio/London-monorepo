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

const TabGroupButton = styled.button<{ isActive?: boolean }>`
  border: none;
  background: ${(p) => (p.isActive ? 'black' : '#f5f5f5')};
  color: ${(p) => (p.isActive ? 'white' : 'black')};
  text-align: center;
  font-size: 18px;
  line-height: 18px;
  font-weight: 500;
  width: 100%;
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
    background: ${(p) => (p.isActive ? 'black' : '#e5e5e5')};
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

export const AshenAndGiftMint: FC<{}> = ({}) => {
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

const ButtonFlex = styled(FlexEnds)`
  border: 1px solid black;
`;

const StyledSelect = styled.select`
  font-weight: bold;
  border: none;
  outline: none;
  padding-right: 5px;
  text-align-last: right;
`;

const MintContent: FC = () => {
  const minter = useLondonEmbersMinterContract();

  const { account } = useWeb3React();
  const tokenBalance = useTokensStore((s) => s.tokenBalance);
  const addTransaction = useTransactionsStore((s) => s.addTransaction);

  const [burnedAsset, setBurnedAsset] = useState<'ember' | 'gift'>('gift');
  const selectedCollectionAddress = useMemo(() => {
    if (burnedAsset === 'ember') {
      return deployments[CHAIN_ID].embers;
    } else {
      return deployments[CHAIN_ID].gift;
    }
  }, [burnedAsset]);
  const [selectedAssets, setSelectedAssets] = useState<OPENSEA_ASSET[]>([]);
  useEffect(() => {
    setSelectedAssets([]);
  }, [burnedAsset]);

  const londonAssets = useLondonAssets(account ?? NULL_ADDRESS);

  const selectableRange = useMemo(() => {
    return burnedAsset === 'ember'
      ? BURN_MIN_MAX_AMOUNT_FOR_SELF
      : BURN_MIN_MAX_AMOUNT_FOR_GIFTS;
  }, [burnedAsset]);

  const mintableAmount = useMemo(() => {
    return burnedAsset === 'gift'
      ? BURN_GIFT_AMOUNT_TO_EMBERS(selectedAssets.length)
      : BURN_EMBERS_AMOUNT_TO_EMBERS(selectedAssets.length);
  }, [burnedAsset, selectedAssets]);

  const londonNeeded = useMemo(() => {
    return burnedAsset === 'gift'
      ? BURN_LONDON_FEE_FOR_GIFTS[selectedAssets.length]
      : BURN_LONDON_FEE_FOR_SELF[selectedAssets.length];
  }, [burnedAsset, selectedAssets]);

  const [feeAsset, setFeeAsset] = useState<'ETH' | 'LONDON'>('ETH');

  const isLondonApproved = useIsApproved(
    feeAsset === 'ETH' ? undefined : londonNeeded,
  );

  const ethBalance = useBlockchainStore(
    useCallback(
      (s) => (!!account ? s.balanceMap[account] : undefined),
      [account],
    ),
  );

  const ethNeeded = useEthPriceOfLondon(
    feeAsset === 'ETH' ? londonNeeded : undefined,
  );

  const isWithinSelectedRange = useMemo(
    () =>
      selectedAssets.length >= selectableRange[0] &&
      selectedAssets.length <= selectableRange[1],
    [selectedAssets, selectableRange],
  );

  const isEthBalanceEnough = useMemo(() => {
    return (
      !!ethBalance && !!ethNeeded && BigNumber.from(ethBalance).gte(ethNeeded)
    );
  }, [ethNeeded, ethBalance]);

  const isLondonBalanceEnough = useMemo(() => {
    return !!londonNeeded && !!tokenBalance && tokenBalance.gte(londonNeeded);
  }, [londonNeeded, tokenBalance]);

  const mintCheck = useMintCheck(
    account ?? undefined,
    burnedAsset === 'ember' ? 'ashen' : 'gift',
    mintableAmount ?? 0,
  );

  const isMintCheckReady = useMemo(() => {
    return !!mintCheck && mintCheck.uris.length == mintableAmount;
  }, [mintCheck, mintableAmount]);

  const giftBurned = useGiftBurned();
  const isGiftBurnable = useMemo(() => {
    return giftBurned !== undefined && BURN_MAX_AMOUNT_GIFTS > giftBurned;
  }, [giftBurned]);

  const [isGiftApproved, isEmbersApproved] = useGiftAndEmbersIsApproved(
    account ?? undefined,
  );

  const [isApprovalModalOpen, setIsApprovalModal] = useState(false);

  const isApproved = useMemo(
    () =>
      ((feeAsset === 'LONDON' && isLondonApproved) || feeAsset === 'ETH') &&
      ((burnedAsset === 'gift' && isGiftApproved) ||
        (burnedAsset === 'ember' && isEmbersApproved)),
    [burnedAsset, feeAsset, isEmbersApproved, isGiftApproved, isLondonApproved],
  );
  const isEnoughBalance = useMemo(
    () =>
      (feeAsset === 'ETH' && isEthBalanceEnough) ||
      (feeAsset === 'LONDON' && isLondonBalanceEnough),
    [isEthBalanceEnough, feeAsset, isLondonBalanceEnough],
  );

  useEffect(() => {
    if (isApprovalModalOpen && isApproved) {
      setIsApprovalModal(false);
    }
  }, [isApprovalModalOpen, isApproved]);

  const isMintable = useMemo(() => {
    return (
      isWithinSelectedRange &&
      isMintCheckReady &&
      isApproved &&
      isEnoughBalance &&
      (burnedAsset === 'ember' || isGiftBurnable)
    );
  }, [
    isWithinSelectedRange,
    isMintCheckReady,
    feeAsset,
    isEthBalanceEnough,
    isApproved,
    isLondonBalanceEnough,
    burnedAsset,
    isGiftBurnable,
  ]);

  const { txStatus: giftTxStatus } = useEmberTxStatus('gift');
  const { txStatus: ashenTxStatus } = useEmberTxStatus('ashen');

  const isMinting = useMemo(() => {
    return giftTxStatus === 'in-progress' || ashenTxStatus === 'in-progress';
  }, [giftTxStatus, ashenTxStatus]);

  const addSelectedAssets = useCallback(
    (asset: OPENSEA_ASSET) => {
      if (isMinting) {
        return;
      }
      setSelectedAssets((a) => a.concat([asset]));
    },
    [isMinting],
  );
  const removeSelectedAssets = useCallback(
    (asset: OPENSEA_ASSET) => {
      if (isMinting) {
        return;
      }
      setSelectedAssets((a) => a.filter((a) => a.id !== asset.id));
    },
    [isMinting],
  );

  const [error, setError] = useState<any | undefined>(undefined);

  const mint = useCallback(async () => {
    if (!account || !minter || !mintCheck) {
      return;
    }
    try {
      const tokenIds = selectedAssets.map((a) => a.id);
      console.log(tokenIds);
      if (burnedAsset === 'ember') {
        const res = await minter.mintAshenType(tokenIds, mintCheck, {
          value: feeAsset === 'ETH' ? ethNeeded : undefined,
        });
        addTransaction(res.hash, {
          tokenType: 'ashen',
          type: 'embers-minting',
        });
        setError(undefined);
      } else if (burnedAsset === 'gift') {
        const res = await minter.mintGiftType(tokenIds, mintCheck, {
          value: feeAsset === 'ETH' ? ethNeeded : undefined,
        });
        addTransaction(res.hash, {
          tokenType: 'gift',
          type: 'embers-minting',
        });
        setError(undefined);
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [
    feeAsset,
    ethNeeded,
    burnedAsset,
    selectedAssets,
    mintCheck,
    minter,
    account,
  ]);

  const onButtonClick = useCallback(() => {
    if (isMintable) {
      mint();
    } else {
      setIsApprovalModal(true);
    }
  }, [mint, isMintable]);

  const isButtonDisabled = useMemo(() => {
    return (
      !account ||
      !(
        isWithinSelectedRange &&
        isMintCheckReady &&
        isEnoughBalance &&
        (burnedAsset === 'ember' || isGiftBurnable)
      ) ||
      isMinting
    );
  }, [
    account,
    isMintable,
    isEnoughBalance,
    burnedAsset,
    isMinting,
    isGiftBurnable,
    isMintCheckReady,
    isWithinSelectedRange,
  ]);

  const buttonText = useMemo(() => {
    if (selectedAssets.length < selectableRange[0]) {
      return 'Select more to burn';
    }
    if (selectedAssets.length > selectableRange[1]) {
      return 'Selected too much';
    }
    if (burnedAsset === 'gift' && !isGiftBurnable) {
      return 'Sold out';
    }
    if (!isEnoughBalance) {
      if (feeAsset === 'ETH') {
        return `Need ${
          !!ethNeeded ? utils.formatEther(ethNeeded).slice(0, 7) : '-'
        } ${feeAsset} to mint`;
      }
      return `Need ${
        !!londonNeeded ? utils.formatEther(londonNeeded).slice(0, 7) : '-'
      } ${feeAsset} to mint`;
    }
    if (!isMintCheckReady) {
      return `Generating art...`;
    }
    if (!isApproved) {
      return `Approve to mint`;
    }
    if (
      error ||
      (burnedAsset === 'gift' && giftTxStatus === 'failed') ||
      (burnedAsset === 'ember' && ashenTxStatus === 'failed')
    ) {
      return 'Oop try again?';
    }
    if (
      (burnedAsset === 'gift' && giftTxStatus === 'in-progress') ||
      (burnedAsset === 'ember' && ashenTxStatus === 'in-progress')
    ) {
      return `Minting...`;
    }
    if (
      (burnedAsset === 'gift' && giftTxStatus === 'success') ||
      (burnedAsset === 'ember' && ashenTxStatus === 'success')
    ) {
      return `Minted`;
    }
    if (feeAsset === 'ETH') {
      return `Mint for ${
        !!ethNeeded ? utils.formatEther(ethNeeded).slice(0, 7) : '-'
      } ${feeAsset}`;
    }
    return `Mint for ${
      !!londonNeeded ? utils.formatEther(londonNeeded).slice(0, 7) : '-'
    } ${feeAsset}`;
  }, [
    feeAsset,
    ethNeeded,
    londonNeeded,
    selectedAssets,
    selectableRange,
    error,
    burnedAsset,
    isMinting,
    isMintCheckReady,
    isGiftBurnable,
    isEnoughBalance,
    giftTxStatus,
    ashenTxStatus,
    isApproved,
  ]);

  return (
    <>
      <MintBody>
        <FlexEnds>
          <Text>
            <Italic>Select: </Italic>
          </Text>
          <Text>
            Burn between {selectableRange[0]}-{selectableRange[1]}
          </Text>
        </FlexEnds>
        <ButtonFlex style={{ marginTop: 14 }}>
          <TabGroupButton
            disabled={isMinting}
            isActive={burnedAsset === 'gift'}
            style={{ borderRight: '1px solid black' }}
            onClick={() => setBurnedAsset('gift')}
          >
            GIFTs
          </TabGroupButton>
          <TabGroupButton
            disabled={isMinting}
            isActive={burnedAsset === 'ember'}
            onClick={() => setBurnedAsset('ember')}
          >
            EMBERs
          </TabGroupButton>
        </ButtonFlex>
        <UserSection
          selectableRange={selectableRange}
          label={`Select ${burnedAsset.toUpperCase()}s`}
          items={londonAssets}
          selectedCollectionAddress={selectedCollectionAddress}
          selectedAssets={selectedAssets}
          removeSelectedAssets={removeSelectedAssets}
          addSelectedAssets={addSelectedAssets}
        />
        <FlexEnds style={{ marginTop: 24 }}>
          <Text>
            Burn {selectedAssets.length === 0 ? '-' : selectedAssets.length}{' '}
            {burnedAsset.toUpperCase()}
            {selectedAssets.length === 1 ? '' : 's'}
          </Text>
          →
          <Text>
            Mint {mintableAmount ?? '-'} EMBER{mintableAmount === 1 ? '' : 's'}
          </Text>
        </FlexEnds>
      </MintBody>
      <MintBody style={{ borderTop: '1px solid black' }}>
        <FlexEnds>
          <Text>Pay in: </Text>
          <StyledSelect
            onChange={(e) => {
              setFeeAsset(e.target.value as any);
            }}
            value={feeAsset}
          >
            <option value={'ETH'}>ETH</option>
            <option value={'LONDON'}>LONDON</option>
          </StyledSelect>
        </FlexEnds>
        <Button
          style={{ width: '100%', marginTop: 14 }}
          disabled={isButtonDisabled}
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </MintBody>
      {isApprovalModalOpen && (
        <ApprovalCard
          dismiss={() => setIsApprovalModal(false)}
          burnedAssetAddress={
            burnedAsset === 'ember'
              ? deployments[CHAIN_ID].embers
              : deployments[CHAIN_ID].gift
          }
          isLondonApprovalNeeded={feeAsset === 'LONDON'}
          londonNeeded={londonNeeded}
        />
      )}
    </>
  );
};

const ApprovalBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ApprovalContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: 1px solid black;
  background: white;
`;

const ApprovalBody = styled.div`
  padding: 14px 14px 4px 14px;
`;
const ApprovalCard: FC<{
  dismiss: () => void;
  burnedAssetAddress: string;
  isLondonApprovalNeeded?: boolean;
  londonNeeded: BigNumber;
}> = ({
  dismiss,
  burnedAssetAddress,
  isLondonApprovalNeeded,
  londonNeeded,
}) => {
  const { txStatus: approvalTxStatus, approve } = useSetApprove();
  const { txStatus: approvalNFTTxStatus, approve: approveNFT } =
    useSetNFTApprove(burnedAssetAddress);

  const isLondonApproved = useIsApproved(londonNeeded);
  const { account } = useWeb3React();
  const isLondonApprovalButtonDisabled = useMemo(() => {
    return !account || isLondonApproved || approvalTxStatus === 'in-progress';
  }, [account, isLondonApproved, approvalTxStatus]);

  const isNFTApprovalButtonDisabled = useMemo(() => {
    return !account || approvalNFTTxStatus === 'in-progress';
  }, [account, approvalNFTTxStatus]);

  const approveLondonButtonText = useMemo(() => {
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
  }, [approvalTxStatus]);

  const approveNFTButtonText = useMemo(() => {
    if (approvalNFTTxStatus === 'failed') {
      return 'Oop try again?';
    }
    if (approvalNFTTxStatus === 'in-progress') {
      return `Approving...`;
    }
    if (approvalNFTTxStatus === 'success') {
      return `Approved`;
    }
    return `Approve NFT to burn`;
  }, [approvalNFTTxStatus]);

  return (
    <ApprovalBackground>
      <ApprovalContainer>
        <ApprovalBody>
          {isLondonApprovalNeeded && !isLondonApproved && (
            <Button
              style={{ width: '100%', marginBottom: 14 }}
              disabled={isLondonApprovalButtonDisabled}
              onClick={() => approve()}
            >
              {approveLondonButtonText}
            </Button>
          )}
          <Button
            style={{ width: '100%' }}
            disabled={isNFTApprovalButtonDisabled}
            onClick={() => approveNFT()}
          >
            {approveNFTButtonText}
          </Button>
          <FlexCenter style={{ marginTop: 4 }}>
            <A onClick={dismiss} style={{ cursor: 'pointer' }}>
              Dismiss
            </A>
          </FlexCenter>
        </ApprovalBody>
      </ApprovalContainer>
    </ApprovalBackground>
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

const UserSection: FC<{
  label: string;
  removeSelectedAssets: (asset: OPENSEA_ASSET) => void;
  addSelectedAssets: (asset: OPENSEA_ASSET) => void;
  selectedAssets: OPENSEA_ASSET[];
  items: OPENSEA_COLLECTION[];
  selectedCollectionAddress: string;
  selectableRange: [number, number];
}> = ({
  label,
  selectedAssets,
  items,
  selectedCollectionAddress,
  removeSelectedAssets,
  addSelectedAssets,
  selectableRange,
}) => {
  const selectedCollection = useMemo(() => {
    return items.find((i) => i.contract === selectedCollectionAddress);
  }, [items, selectedCollectionAddress]);

  return (
    <UserSectionContainer>
      {/* <FlexEnds>
        <Text><Bold>{label}</Bold></Text>
        <Text>Burn between {selectableRange[0]}-{selectableRange[1]}</Text>
      </FlexEnds> */}
      {!items || items.length === 0 || !selectedCollection ? (
        <EmptyCollectionContainer>
          <Text style={{ opacity: 0.5 }}>Do not own any.</Text>
        </EmptyCollectionContainer>
      ) : (
        <CollectionBody>
          {selectedCollection?.assets.map((asset: OPENSEA_ASSET) => (
            <Asset
              isSelected={
                findIndex(selectedAssets, (a) => a.id === asset.id) !== -1
              }
              onClick={() => {
                if (
                  findIndex(selectedAssets, (a) => a.id === asset.id) !== -1
                ) {
                  removeSelectedAssets(asset);
                } else {
                  if (selectedAssets.length >= selectableRange[1]) {
                    return;
                  }
                  addSelectedAssets(asset);
                }
              }}
              key={`asset-${asset.name}`}
            >
              <img src={asset.image} />
            </Asset>
          ))}
        </CollectionBody>
      )}
    </UserSectionContainer>
  );
};
