import React from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Bold, Title, Caption, Italic } from '../components/text';
import { Header } from '../components/header';
import { AvatarCanvas } from '../components/avatar';

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
        </AvatarConsole>
      </PageWrapper>
    </>
  );
};

const PageWrapper = styled.div`
  /* display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 0.4fr 1fr 0.4fr; */
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

const AvatarConsole = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid black;
  margin-top: 24px;
`;

const AvatarLeftWell = styled.div`
  height: 100%;
  border-right: 1px solid black;
`;

export default React.memo(IndexPage);
