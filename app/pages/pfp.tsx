import React, { FC, useEffect, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Bold, Title, Caption, Italic } from '../components/text';
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
import { Flex, FlexCenter } from '../components/flex';

export const SUPPORTED_PFPS = [
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // BAYC
  '0x1a92f7381b9f03921564a437210bb9396471050c', // Cool Cats
];

const IndexPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>$LONDON</Bold> background change service
        </Title>
        <Caption>
          <Italic>Complementary service for all avatars!</Italic>
        </Caption>
        <AvatarConsoleWrapper>
          <AvatarConsole>
            <AvatarLeftWell>
              <AvatarCanvas
                foregroundImageSrc={
                  'https://lh3.googleusercontent.com/JDz86_qE-kHyYOoumnxQtOTHsd3IqknC7cv7-zemonq709CrBCLU7G4IR0C4DyTMT-go7DjHi_4Q-dgW7ZSHOapM8VmfahURwnIH=w600'
                }
                backgroundImageSrc={
                  'https://bafybeiaxk2s7ma4p4jjh2j6ix5zxvnynekfa6ey4q5iyvch4kqyrdnynzy.ipfs.dweb.link/'
                }
              />
            </AvatarLeftWell>
            <RightColumn />
          </AvatarConsole>
        </AvatarConsoleWrapper>
      </PageWrapper>
    </>
  );
};
export default React.memo(IndexPage);

const UserSection: FC<{ items: OPENSEA_COLLECTION[] }> = ({ items }) => (
  <>
    <RightWellBox>
      {items.map((collection: OPENSEA_COLLECTION) => (
        <Collection>
          <CollectionTitle>
            <img src={collection.avatar} />
            {collection.name}
          </CollectionTitle>
          <CollectionBody>
            <CollectionBodyInner>
              {collection.assets.map((asset: OPENSEA_ASSET) => (
                <Asset>
                  <img src={asset.image} height={128} />
                  {asset.name}
                </Asset>
              ))}
            </CollectionBodyInner>
          </CollectionBody>
        </Collection>
      ))}
    </RightWellBox>
  </>
);
const Asset = styled.div`
  display: flex;
  align-items: center;
  &:not(:first-child) {
    margin-top: 16px;
  }
  img {
    margin-right: 16px;
  }
`;
const Collection = styled.div`
  display: flex;
  flex-direction: column;
  &:not(:first-child) {
    margin-top: 8px;
  }
`;
const CollectionBody = styled.div`
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(0, 0, 0, 0.5);
  margin-top: 8px;
  margin-left: 18px;
`;
const CollectionBodyInner = styled.div`
  padding: 8px 16px;
`;
const CollectionTitle = styled.div`
  display: flex;
  align-items: center;
  img {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    margin-right: 12px;
  }
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  color: black;
`;
const AssetsWrapper = styled.div`
  padding: 16px 12px;
`;

const UserAssets: FC<{ account: string }> = ({ account }) => {
  const otherAssets = useOtherAssets(account, SUPPORTED_PFPS);
  const pobAssets = usePobAssets(account);
  return (
    <>
      {/* <UserSection items={otherAssets} /> */}
      <UserSection items={pobAssets} />
    </>
  );
};

const RightColumn: FC = () => {
  const { account } = useWeb3React();
  return (
    <>
      <AvatarRightWell>
        <AssetsWrapper>
          <UserAssets account={'0xcc5ddc8ccd5b1e90bc42f998ec864ead0090a12b'} />{' '}
        </AssetsWrapper>
        {/* {!!account ? <UserAssets account={account} /> : <Web3Handler />} */}
      </AvatarRightWell>
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

const AvatarConsoleWrapper = styled(FlexCenter)`
  padding: 24px;
  width: 100%;
`;
const AvatarConsole = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  border: 1px solid black;
  width: 800px;
  height: 450px;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
    grid-template-columns: 1fr;
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
  overflow: scroll;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-right: 1px solid black;
`;
