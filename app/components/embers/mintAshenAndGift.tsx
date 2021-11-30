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
  const addSelectedAssets = useCallback((asset: OPENSEA_ASSET) => {
    setSelectedAssets((a) => a.concat([asset]));
  }, []);
  const removeSelectedAssets = useCallback((asset: OPENSEA_ASSET) => {
    setSelectedAssets((a) => a.filter((a) => a.id !== asset.id));
  }, []);
  const londonAssets = useLondonAssets(account ?? NULL_ADDRESS);
  console.log(londonAssets);

  return (
    <>
      <MintBody>
        <FlexEnds>
          <Text>
            <Italic>Burn!!!</Italic>
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
        <ButtonFlex style={{ margin: '14px 0' }}>
          <TabGroupButton
            isActive={burnedAsset === 'gift'}
            style={{ borderRight: '1px solid black' }}
            onClick={() => setBurnedAsset('gift')}
          >
            GIFTs
          </TabGroupButton>
          <TabGroupButton
            isActive={burnedAsset === 'ember'}
            onClick={() => setBurnedAsset('ember')}
          >
            EMBERs
          </TabGroupButton>
        </ButtonFlex>
        <UserSection
          label={`Select ${burnedAsset.toUpperCase()}s to burn`}
          items={londonAssets}
          selectedCollectionAddress={selectedCollectionAddress}
          selectedAssets={selectedAssets}
          removeSelectedAssets={removeSelectedAssets}
          addSelectedAssets={addSelectedAssets}
        />
        {/* <FlexEnds style={{ marginTop: 24 }}>
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
                parseInt(e.target.value) > MAX_MINT_PER_TX
                  ? MAX_MINT_PER_TX
                  : parseInt(e.target.value),
              )
            }
          />
        </Flex> */}
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

const UserSectionContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

const CollectionBody = styled.div<{ isVerticalScroll?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 14px;
  overflow: auto;
  margin: 0;
  margin-top: 14px;
  max-height: 360px;
  background: #f6f6f6;
  // scrollbar-width: none; /* Firefox */
  // ::-webkit-scrollbar {
  //   height: 0;
  //   width: 0; /* Remove scrollbar space */
  //   background: transparent; /* Optional: just make scrollbar invisible */
  // }
`;

const Asset = styled.div<{ isSelected?: boolean }>`
  opacity: ${(p) => (p.isSelected ? 1 : 0.4)};
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
}> = ({
  label,
  selectedAssets,
  items,
  selectedCollectionAddress,
  removeSelectedAssets,
  addSelectedAssets,
}) => {
  const selectedCollection = useMemo(() => {
    return items.find((i) => i.contract === selectedCollectionAddress);
  }, [items, selectedCollectionAddress]);

  // if (!items || items.length === 0 || !selectedCollection) {
  //   return (
  //     <UserSectionContainer>
  //       <FlexEnds>
  //         <Text>{label}</Text>
  //         <Flex>
  //           <StyledSelect
  //             onChange={(e) => {
  //               setSelectedCollectionAddress(e.target.value);
  //               setSelectedProject?.(e.target.value);
  //             }}
  //             value={selectedCollectionAddress}
  //           >
  //             {selectableAssetAndNames?.map((i) => {
  //               return (
  //                 <option value={i[0]} key={`option-1-${i}`}>
  //                   {i[1]}
  //                 </option>
  //               );
  //             })}
  //           </StyledSelect>
  //         </Flex>
  //       </FlexEnds>
  //       <FlexCenter
  //         style={{ width: '100%', height: isVerticalScroll ? 178 : 81 }}
  //       >
  //         <Text style={{ opacity: 0.5 }}>
  //           Do not own any. Buy{' '}
  //           <A
  //             target={'blank'}
  //             href={getOpenSeaAssetUrl(selectedCollectionAddress ?? '-')}
  //           >
  //             here
  //           </A>
  //           .
  //         </Text>
  //       </FlexCenter>
  //     </UserSectionContainer>
  //   );
  // }

  return (
    <UserSectionContainer>
      <FlexEnds>
        <Text>{label}</Text>
      </FlexEnds>
      <CollectionBody>
        {selectedCollection?.assets.map((asset: OPENSEA_ASSET) => (
          <Asset
            isSelected={
              findIndex(selectedAssets, (a) => a.id === asset.id) !== -1
            }
            onClick={() => {
              if (findIndex(selectedAssets, (a) => a.id === asset.id) !== -1) {
                removeSelectedAssets(asset);
              } else {
                addSelectedAssets(asset);
              }
            }}
            key={`asset-${asset.name}`}
          >
            <img src={asset.image} />
          </Asset>
        ))}
      </CollectionBody>
    </UserSectionContainer>
  );
};
