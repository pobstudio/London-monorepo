import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Text, Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { AvatarCanvas } from '../components/avatar';
import { useWeb3React } from '@web3-react/core';
import { WalletState, Web3Status } from '../components/web3Status';
import { PFP } from '../components/pfp';
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
  [HASH_CONTRACT, '$HASH'],
];

export const SELECTABLE_FOREGROUND: [string, string][] = [
  ['0x4c4808459452c137fb9bf3e824d4d7ac73655f54', 'Quilts'],
  ['0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', 'Doodles'],
  ['0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', 'BAYC'],
  ['0x60e4d786628fea6478f785a6d7e704777c86a7c6', 'MAYC'],
  ['0xbd3531da5cf5857e7cfaa92426877b022e612cf8', 'Pudgy Penguins'],
  ['0x1a92f7381b9f03921564a437210bb9396471050c', 'Cool Cats'],
  ['0x85f740958906b317de6ed79663012859067e745b', 'Wicked Cranium'],
  ['0xb47e3cd837ddf8e4c57f05d70ab86ga5de6e193bbb', 'CryptoPunks'],
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
];

export const PER_PROJECT_SETTINGS: { [key: string]: any } = {
  '0x031920cc2d9f5c10b444fd44009cd64f829e7be2': {
    thresholds: [0.01, 0.3, 0.3],
  },
};

const IndexPage: NextPage = () => {
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>LONDON Gift</Bold> background change service
        </Title>
        <Caption>
          <Italic>Complementary service for all avatars + LONDON gifts!</Italic>
        </Caption>
        <PFP />
      </PageWrapper>
    </>
  );
};

export default React.memo(IndexPage);

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
