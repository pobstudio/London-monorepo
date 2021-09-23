import React, { useCallback, useState, useEffect, useRef } from 'react';
import { NextPage } from 'next';
import styled from 'styled-components';
import { Bold, Title, Caption, MiniText } from '../components/text';
import { FlexCenter } from '../components/flex';
import { Header } from '../components/header';
import { POBIcon } from '../components/icons/pob';
import { PRINT_DIMENSIONS } from '@pob/sketches';

import { MAX_TOKEN_ID } from '../constants/parameters';
import { GIFT_TOKEN_ID_VALID } from '../utils/regex';
import { useCanvas } from '../hooks/useCanvas';
import { useDebounce } from '../hooks/useDebounce';

const tokenIDfromString = (tokenID: string): number => {
  if (tokenID) {
    const token = Math.round(Number(tokenID));
    return GIFT_TOKEN_ID_VALID(token) ? token : -1;
  } else {
    return -1;
  }
};

const DownloadPage: NextPage = () => {
  const [tokenID, setTokenID] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const typing = useCallback((e) => {
    setTokenID(e.target.value);
  }, []);
  const debouncedTokenID = useDebounce(tokenID, 500);
  const tokenNum = tokenID !== '' ? tokenIDfromString(debouncedTokenID) : -1;
  const { canvasImgData } = useCanvas(tokenNum, canvasRef);
  return (
    <>
      <Header />
      <PageWrapper>
        <Title>
          <Bold>High-Res Downloader</Bold>
        </Title>
        <Caption style={{ marginBottom: 12 }}>
          Download artwork at{' '}
          {`${PRINT_DIMENSIONS[0]}px x ${PRINT_DIMENSIONS[1]}px`} resolution
        </Caption>

        <input
          style={{ width: 512 }}
          spellCheck="false"
          onChange={typing}
          value={tokenID}
          placeholder={`Enter valid LONDON Gift Token ID (0 - ${MAX_TOKEN_ID})...`}
        />
        <br />
        <br />
        <a href={canvasImgData} download={`${tokenNum}.png`}>
          <Button disabled={!canvasImgData || !tokenID || tokenNum < 0}>
            Download
          </Button>
        </a>

        <div style={{ opacity: 0, width: 1, height: 1 }}>
          <canvas ref={canvasRef} />
        </div>

        <MiniText style={{ marginTop: 256 }}>
          Omne quod movetur ab alio movetur
        </MiniText>
        <FlexCenter style={{ margin: '24px 0' }}>
          <POBIcon />
        </FlexCenter>
      </PageWrapper>
    </>
  );
};

export default React.memo(DownloadPage);

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 14px;
  flex-direction: column;
  padding-top: 240px;
  > p + p {
    margin-top: 20px;
  }
`;

const Button = styled.button`
  cursor: pointer;
  &:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }
`;
