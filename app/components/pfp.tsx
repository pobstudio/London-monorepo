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
import { CHAIN_ID, HASH_CONTRACT, LONDON_GIFT_CONTRACT } from '../constants';
import { A, AButton } from '../components/anchor';
import { getOpenSeaAssetUrl } from '../utils/urls';
import { EmbersAvatarCanvas } from './embersAvatar';
import { deployments } from '@pob/protocol';
export const SELECTABLE_BACKGROUND: [string, string][] = [
  [deployments[CHAIN_ID].embers, 'LONDON embers'],
  [LONDON_GIFT_CONTRACT, 'LONDON gift'],
  [HASH_CONTRACT, '$HASH'],
];

export const SELECTABLE_FOREGROUND: [string, string][] = [
  ['0x4c4808459452c137fb9bf3e824d4d7ac73655f54', 'Quilts'],
  ['0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', 'Doodles'],
  ['0x31d4da52c12542ac3d6aadba5ed26a3a563a86dc', 'Fly Frogs'],
  ['0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', 'BAYC'],
  ['0x60e4d786628fea6478f785a6d7e704777c86a7c6', 'MAYC'],
  ['0xbd3531da5cf5857e7cfaa92426877b022e612cf8', 'Pudgy Penguins'],
  ['0x1a92f7381b9f03921564a437210bb9396471050c', 'Cool Cats'],
  ['0x85f740958906b317de6ed79663012859067e745b', 'Wicked Cranium'],
  ['0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', 'CryptoPunks'],
  ['0x02aa731631c6d7f8241d74f906f5b51724ab98f8', 'BearsOnTheBlock'],
  ['0x031920cc2d9f5c10b444fd44009cd64f829e7be2', 'CryptoZunks'],
  ['0xdb55584e5104505a6b38776ee4dcba7dd6bb25fe', 'Imma Degen'],
  ['0xe19b9d6538c1ab71434098d9806a7cec5b186ba0', 'Bored Bananas'],
  ['0xd7b397edad16ca8111ca4a3b832d0a5e3ae2438c', 'Gutter Rats'],
  ['0xf4ee95274741437636e748ddac70818b4ed7d043', 'The Doge Pound'],
  ['0x099689220846644f87d1137665cded7bf3422747', 'Robotos'],
  ['0xef0182dc0574cd5874494a120750fd222fdb909a', 'Rumble Kong'],
  ['0xedb61f74b0d09b2558f1eeb79b247c1f363ae452', 'Gutter Cat Gang'],
  ['0x31385d3520bced94f77aae104b406994d8f2168c', 'Bastard GAN punk v2'],
  ['0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb', 'Vee Friends'],
  ['0xbea8123277142de42571f1fac045225a1d347977', 'DystoPunks V2'],
  ['0x495f947276749ce646f68ac8c248420045cb7b5e', 'DystoPunks V1'],
  ['0x5fd335e64400eabecc9ebe80e3d2fcfb6c001adb', 'Niftysistas'],
  ['0x892555e75350e11f2058d086c72b9c94c9493d72', 'Niftydudes'],
  ['0x2acab3dea77832c09420663b0e1cb386031ba17b', 'DeadFellaz'],
  ['0x495f947276749ce646f68ac8c248420045cb7b5e', '24px Cats'],
  ['0x488a85d21ac95c9bb0cdaa0d2bfa427fcea88d1e', 'Bored Punk Yacht Club'],
  ['0x97597002980134bea46250aa0510c9b90d87a587', 'Chain Runners'],
  ['0x45db714f24f5a313569c41683047f1d49e78ba07', 'SpacePunksClub'],
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
