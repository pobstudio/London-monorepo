import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BLOCK_NUMBER_UP_TO } from '../constants/parameters';
import { useBlockchainStore } from '../stores/blockchain';
import { FlexCenterColumn } from './flex';

const CountdownContainer = styled(FlexCenterColumn)``;

const CountdownHeader = styled.h1`
  margin: 0;
  color: white;
  opacity: 0.15;
  font-size: 144px;
  font-weight: 500;
  line-height: 144px;
`;

const CountdownLabel = styled.p`
  margin: 0;
  color: white;
  opacity: 0.15;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

export const Countdown: FC = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  return (
    <CountdownContainer>
      <CountdownHeader>{blocksLeft ?? '-'}</CountdownHeader>
      <CountdownLabel>BLOCKS LEFT</CountdownLabel>
    </CountdownContainer>
  );
};
