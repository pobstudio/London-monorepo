import React, { FC, useEffect, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { AvatarCanvas } from '../components/avatar';
import { useWeb3React } from '@web3-react/core';
import { WalletState, Web3Status } from '../components/web3Status';
import { usePrevious } from 'react-use';
import { getUserPobAssets } from '../hooks/useOpenSea';

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
            <AvatarRightWell>
              <Web3Handler />
              <RightWellBox>wiggle</RightWellBox>
              <RightWellBox>wiggle</RightWellBox>
            </AvatarRightWell>
          </AvatarConsole>
        </AvatarConsoleWrapper>
      </PageWrapper>
    </>
  );
};
export default React.memo(IndexPage);

const Web3Handler: FC = () => {
  const { account, active, connector, error } = useWeb3React();
  const [walletView, setWalletView] = useState<WalletState>('connect');
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  const wiggle = getUserPobAssets(account ?? '');
  console.log(wiggle);
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

const AvatarConsoleWrapper = styled.div`
  padding: 24px;
  width: 100%;
`;
const AvatarConsole = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid black;
`;

const RightWellBox = styled.div`
  display: flex;
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
      border-bottom: 1px solid black;
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
