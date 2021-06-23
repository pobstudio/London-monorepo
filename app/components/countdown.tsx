import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BLOCK_NUMBER_UP_TO } from '../constants/parameters';
import { useBlockchainStore } from '../stores/blockchain';
import { FlexCenterColumn, FlexEnds } from './flex';

const CountdownContainer = styled.div`
  /* align-items: baseline; */
  /* width: 100%; */
  /* margin-bottom: -14px; */
  text-align: right;
`;

const CountdownHeader = styled.h1`
  margin: 0;
  padding: 0;
  color: white;
  opacity: 1;
  font-size: 200px;
  letter-spacing: 0;
  font-weight: 300;
  line-height: 1em;
`;

const CountdownLabel = styled.p`
  margin: 0;
  color: white;
  opacity: 1;
  font-size: 18px;
  line-height: 1em;
  font-weight: 300;
`;

export const Countdown: FC = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  return (
    <CountdownContainer>
      <CountdownLabel>Blocks left until london hardfork</CountdownLabel>
      <CountdownHeader>{blocksLeft ?? '-'}</CountdownHeader>
    </CountdownContainer>
  );
};
