import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Text, Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { AvatarCanvas } from '../components/avatar';
import { useWeb3React } from '@web3-react/core';
import { WalletState, Web3Status } from '../components/web3Status';
import { usePrevious } from 'react-use';
import {
  OPENSEA_ASSET,
  OPENSEA_COLLECTION,
  useOtherAssets,
  usePobAssets,
} from '../hooks/useOpenSea';
import { BREAKPTS } from '../styles';
import {
  Flex,
  FlexCenter,
  FlexCenterColumn,
  FlexEnds,
} from '../components/flex';
import {
  CHAIN_ID,
  HASH_CONTRACT,
  LONDON_GIFT_CONTRACT,
  SELECTABLE_FOREGROUND,
} from '../constants';
import { A, AButton } from '../components/anchor';
import { getOpenSeaAssetUrl } from '../utils/urls';
import { EmbersAvatarCanvas } from './embersAvatar';
import { deployments } from '@pob/protocol';
export const SELECTABLE_BACKGROUND: [string, string][] = [
  [deployments[CHAIN_ID].embers, 'LONDON embers'],
  [LONDON_GIFT_CONTRACT, 'LONDON gift'],
  [HASH_CONTRACT, '$HASH'],
];

export const PER_PROJECT_SETTINGS: { [key: string]: any } = {
  '0x031920cc2d9f5c10b444fd44009cd64f829e7be2': {
    thresholds: [0.01, 0.3, 0.3],
  },
};

export const PFP: FC = () => {
  const { account } = useWeb3React();
  const [foregroundAsset, setForegroundAsset] = useState<
    OPENSEA_ASSET | undefined
  >();
  const [backgroundAsset, setBackgroundAsset] = useState<
    OPENSEA_ASSET | undefined
  >();

  const [selectedForegroundProject, setSelectedForegroundProject] = useState<
    string | undefined
  >(SELECTABLE_FOREGROUND[0][0]);

  const [selectedBackgroundProject, setSelectedBackgroundProject] = useState<
    string | undefined
  >(SELECTABLE_BACKGROUND[0][0]);

  const canvasSettings = useMemo(
    () =>
      !!selectedForegroundProject
        ? PER_PROJECT_SETTINGS[selectedForegroundProject]
        : {},
    [selectedForegroundProject],
  );

  return (
    <AvatarConsoleWrapper>
      <AvatarConsole>
        <AvatarLeftWell>
          {selectedBackgroundProject === deployments[CHAIN_ID].embers ? (
            <EmbersAvatarCanvas
              {...canvasSettings}
              foregroundImageSrc={foregroundAsset?.image}
              backgroundEmbersTokenId={backgroundAsset?.id}
            />
          ) : (
            <AvatarCanvas
              {...canvasSettings}
              foregroundImageSrc={foregroundAsset?.image}
              backgroundImageSrc={backgroundAsset?.image}
            />
          )}
        </AvatarLeftWell>
        <AvatarRightWell>
          {!!account ? (
            <UserAssets
              foregroundAsset={foregroundAsset}
              backgroundAsset={backgroundAsset}
              setForegroundAsset={setForegroundAsset}
              setBackgroundAsset={setBackgroundAsset}
              setSelectedBackgroundProject={setSelectedBackgroundProject}
              setSelectedForegroundProject={setSelectedForegroundProject}
              account={account}
            />
          ) : (
            <Web3Handler />
          )}
        </AvatarRightWell>
      </AvatarConsole>
    </AvatarConsoleWrapper>
  );
};

const StyledSelect = styled.select`
  font-weight: bold;
  border: none;
  outline: none;
  padding-right: 5px;
  text-align-last: right;
`;

const UserSectionContainer = styled.div`
  padding: 12px;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
`;

const UserSection: FC<{
  isVerticalScroll?: boolean;
  label: string;
  setAsset: (src: OPENSEA_ASSET) => void;
  selectedAsset?: OPENSEA_ASSET;
  items: OPENSEA_COLLECTION[];
  setSelectedProject?: (address: string) => void;
  selectableAssetAndNames: [string, string][];
}> = ({
  selectableAssetAndNames,
  setAsset,
  selectedAsset,
  label,
  items,
  isVerticalScroll,
  setSelectedProject,
}) => {
  const [selectedCollectionAddress, setSelectedCollectionAddress] = useState<
    string | undefined
  >();

  const selectedCollection = useMemo(() => {
    return items.find((i) => i.contract === selectedCollectionAddress);
  }, [items, selectedCollectionAddress]);

  useEffect(() => {
    if (!selectableAssetAndNames?.[0]) {
      return;
    }
    setSelectedCollectionAddress(selectableAssetAndNames[0][0]);
  }, [selectableAssetAndNames]);

  if (!items || items.length === 0 || !selectedCollection) {
    return (
      <UserSectionContainer>
        <FlexEnds>
          <Text>{label}</Text>
          <Flex>
            <StyledSelect
              onChange={(e) => {
                setSelectedCollectionAddress(e.target.value);
                setSelectedProject?.(e.target.value);
              }}
              value={selectedCollectionAddress}
            >
              {selectableAssetAndNames?.map((i) => {
                return (
                  <option value={i[0]} key={`option-1-${i}`}>
                    {i[1]}
                  </option>
                );
              })}
            </StyledSelect>
          </Flex>
        </FlexEnds>
        <FlexCenter
          style={{ width: '100%', height: isVerticalScroll ? 178 : 81 }}
        >
          <Text style={{ opacity: 0.5 }}>
            Do not own any. Buy{' '}
            <A
              target={'blank'}
              href={getOpenSeaAssetUrl(selectedCollectionAddress ?? '-')}
            >
              here
            </A>
            .
          </Text>
        </FlexCenter>
      </UserSectionContainer>
    );
  }

  return (
    <UserSectionContainer>
      <FlexEnds>
        <Text>{label}</Text>
        <Flex>
          <StyledSelect
            onChange={(e) => {
              setSelectedCollectionAddress(e.target.value);
              setSelectedProject?.(e.target.value);
            }}
            value={selectedCollectionAddress}
          >
            {selectableAssetAndNames?.map((i) => {
              return (
                <option value={i[0]} key={`option-2-${i}`}>
                  {i[1]}
                </option>
              );
            })}
          </StyledSelect>
        </Flex>
      </FlexEnds>
      <CollectionBody isVerticalScroll={isVerticalScroll}>
        {selectedCollection?.assets.map((asset: OPENSEA_ASSET) => (
          <Asset
            isSelected={selectedAsset?.image === asset.image}
            onClick={() => {
              setAsset(asset);
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

const Asset = styled(FlexCenterColumn)<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  opacity: ${(p) => (p.isSelected ? 1 : 0.4)};
  background: #f6f6f6;
  img {
    object-fit: cover;
    background: #f6f6f6;
    height: 81px;
    width: 81px;
  }
`;

const CollectionBody = styled.div<{ isVerticalScroll?: boolean }>`
  display: flex;
  flex-grow: 1;
  flex-wrap: ${(p) => (p.isVerticalScroll ? 'wrap' : 'nowrap')};
  grid-auto-columns: 81px;
  grid-auto-rows: 81px;
  grid-gap: 12px;
  overflow: auto;
  margin: 0;
  margin-top: 12px;
  scrollbar-width: none; /* Firefox */
  ::-webkit-scrollbar {
    height: 0;
    width: 0; /* Remove scrollbar space */
    background: transparent; /* Optional: just make scrollbar invisible */
  }
`;

const ForegroundUserSectionWrapper = styled.div`
  border-bottom: 1px solid black;
`;

const UserAssets: FC<{
  foregroundAsset?: OPENSEA_ASSET;
  backgroundAsset?: OPENSEA_ASSET;
  setForegroundAsset: (src: OPENSEA_ASSET) => void;
  setBackgroundAsset: (src: OPENSEA_ASSET) => void;
  setSelectedForegroundProject: (address: string) => void;
  setSelectedBackgroundProject: (address: string) => void;
  account: string;
}> = ({
  account,
  setForegroundAsset,
  setBackgroundAsset,
  foregroundAsset,
  backgroundAsset,
  setSelectedForegroundProject,
  setSelectedBackgroundProject,
}) => {
  const otherAssets = useOtherAssets(
    account,
    SELECTABLE_FOREGROUND.map((s) => s[0]),
  );
  const pobAssets = usePobAssets(account);
  return (
    <>
      <ForegroundUserSectionWrapper>
        <UserSection
          selectableAssetAndNames={SELECTABLE_BACKGROUND}
          setAsset={setBackgroundAsset}
          selectedAsset={backgroundAsset}
          label={'Select Background'}
          setSelectedProject={setSelectedBackgroundProject}
          items={pobAssets}
        />
      </ForegroundUserSectionWrapper>
      <div style={{ flexGrow: 1 }}>
        <UserSection
          selectableAssetAndNames={SELECTABLE_FOREGROUND}
          setSelectedProject={setSelectedForegroundProject}
          setAsset={setForegroundAsset}
          selectedAsset={foregroundAsset}
          isVerticalScroll={true}
          label={'Select Foreground'}
          items={otherAssets}
        />
      </div>
    </>
  );
};

const Web3Handler: FC = () => {
  const { active, connector, error } = useWeb3React();
  const [walletView, setWalletView] = useState<WalletState>('connect');
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      (active && !activePrevious) ||
      (connector && connector !== connectorPrevious && !error)
    ) {
      setWalletView('account');
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    activePrevious,
    connectorPrevious,
  ]);
  return (
    <>
      {walletView !== 'account' && (
        <Web3Cover>
          <Web3Status />
        </Web3Cover>
      )}
    </>
  );
};

const AvatarConsoleWrapper = styled(FlexCenter)`
  padding: 24px;
  width: 100%;
`;
const AvatarConsole = styled.div`
  display: grid;
  grid-template-columns: minMax(0, 300px) minMax(0, 1fr);
  border: 1px solid black;
  width: 800px;
  min-height: 450px;
  position: relative;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
    grid-template-columns: minMax(0, 200px) minMax(0, 1fr);
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    display: block;
  }
`;

const RightWellBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const AvatarRightWell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: 100%;
  ${RightWellBox} {
    &:first-child {
      /* border-bottom: 1px solid black; */
    }
  }
`;
const Web3Cover = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AvatarLeftWell = styled.div`
  /* display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; */
  height: 100%;
  border-right: 1px solid black;
  background: #f6f6f6;
  @media (max-width: ${BREAKPTS.SM}px) {
    border-right: none;
  }
`;
