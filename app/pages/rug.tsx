import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Text, Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { RugCanvas, RugImgRotations, RugImgSrcs } from '../components/rug';
import { useWeb3React } from '@web3-react/core';
import { WalletState, Web3Status } from '../components/web3Status';
import { usePrevious } from 'react-use';
import { Banner } from '../components/banner';
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
import { HASH_CONTRACT, LONDON_GIFT_CONTRACT } from '../constants';
import { A, AButton } from '../components/anchor';
import { getOpenSeaAssetUrl } from '../utils/urls';

export const SELECTABLE_BACKGROUND: [string, string][] = [
  [LONDON_GIFT_CONTRACT, 'LONDON gift'],
];

const IndexPage: NextPage = () => {
  const { account } = useWeb3React();
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<
    string | undefined
  >();

  // const canvasSettings = useMemo(() => !!selectedForegroundProject ? PER_PROJECT_SETTINGS[selectedForegroundProject] : {}, [selectedForegroundProject]);

  const rugImgSrcs = useMemo(() => {
    if (!backgroundImageSrc) {
      return undefined;
    }
    return [
      backgroundImageSrc,
      backgroundImageSrc,
      backgroundImageSrc,
      backgroundImageSrc,
      backgroundImageSrc,
      backgroundImageSrc,
      backgroundImageSrc,
      backgroundImageSrc,
    ] as RugImgSrcs;
  }, [backgroundImageSrc]);

  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>LONDON Gift</Bold> rug service
        </Title>
        <Caption>
          <Italic>Get rug pulled!</Italic>
        </Caption>
        <Banner />
      </PageWrapper>
    </>
  );
};
export default React.memo(IndexPage);

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
  setImageSrc: (src: string) => void;
  selectedImageSrc?: string;
  items: OPENSEA_COLLECTION[];
  setSelectedProject?: (address: string) => void;
  selectableAssetAndNames: [string, string][];
}> = ({
  selectableAssetAndNames,
  setImageSrc,
  selectedImageSrc,
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
            onChange={(e) => setSelectedCollectionAddress(e.target.value)}
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
            isSelected={selectedImageSrc === asset.image}
            onClick={() => {
              setImageSrc(asset.image);
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
  max-width: 100%;
  width: 100%;
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

const ForegroundUserSectionWrapper = styled.div``;

const UserAssets: FC<{
  backgroundImageSrc?: string;
  setBackgroundImageSrc: (src: string) => void;
  account: string;
}> = ({ account, setBackgroundImageSrc, backgroundImageSrc }) => {
  // const otherAssets = useOtherAssets(
  //   account,
  //   SELECTABLE_FOREGROUND.map((s) => s[0]),
  // );
  const pobAssets = usePobAssets(account);
  return (
    <>
      <ForegroundUserSectionWrapper>
        <UserSection
          selectableAssetAndNames={SELECTABLE_BACKGROUND}
          setImageSrc={setBackgroundImageSrc}
          selectedImageSrc={backgroundImageSrc}
          label={'Select'}
          items={pobAssets}
          isVerticalScroll={true}
        />
      </ForegroundUserSectionWrapper>
      {/* <div style={{ flexGrow: 1 }}>
        <UserSection
          selectableAssetAndNames={SELECTABLE_FOREGROUND}
          setSelectedProject={setSelectedForegroundProject}
          setImageSrc={setForegroundImageSrc}
          selectedImageSrc={foregroundImageSrc}
          isVerticalScroll={true}
          label={'Select Foreground'}
          items={otherAssets}
        />
      </div> */}
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

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 14px;
  flex-direction: column;
  padding-top: 128px;
  > p + p {
    margin-top: 20px;
  }
`;

const RugConsoleWrapper = styled(FlexCenter)`
  padding: 24px;
  width: 100%;
  position: relative;
`;

const RugConsole = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid black;
  width: 800px;
  min-height: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
  }
`;

const RightWellBox = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const BottomBox = styled.div`
  position: relative;
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

const LeftWell = styled.div`
  /* display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; */
  height: 100%;
  background: #f6f6f6;
  @media (max-width: ${BREAKPTS.SM}px) {
    border-right: none;
  }
`;
