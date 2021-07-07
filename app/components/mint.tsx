import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { LONDON_EMOJI, ONE_GWEI, TOKEN_SYMBOL } from '../constants';
import { useMinter } from '../hooks/useMinter';
import { useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { useLoadingText } from '../hooks/useLoadingText';
import { BELL_CURVE_C, BLOCK_NUMBER_UP_TO } from '../constants/parameters';
import { BigNumber } from '@ethersproject/bignumber';
import { utils } from 'ethers';
import { A } from './anchor';
import { FlexCenter, FlexCenterColumn, FlexEnds } from './flex';
import { ASpan, Bold, Text, Title } from './text';
import { useBlockchainStore } from '../stores/blockchain';
import { useGasInfo } from '../hooks/useGasInfo';
import { getTwitterShareLink } from '../utils/twitter';
import { BREAKPTS } from '../styles';

const MintWrapper = styled.div`
  border: 1px solid black;
  width: 450px;
  margin: 48px 0 20px 0;
  @media (max-width: ${BREAKPTS.MD}px) {
    max-width: 100%;
  }
`;

const Button = styled.button`
  border: none;
  border-top: 1px solid black;
  width: 100%;
  background: none;
  color: black;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px;
  text-decoration: underline;
  svg {
    margin-right: 12px;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :hover {
    background: #f6f6f6;
  }
`;

const MintBody = styled.div`
  padding: 8px;
`;

type MintingCardState = 'uninitialized' | 'choose';

type MintingChooseOption =
  | 'current'
  | 'current-little-lower'
  | 'current-more-lower'
  | 'let-wallet-decide'
  | '1559-gwei';

const LITTLE_LOWER_DELTA = 10;
const MORE_LOWER_DELTA = 20;

const MintOptionRow = styled(FlexEnds)``;

const MintOptionRowContainer = styled.div`
  padding: 8px 0;
`;

export const Mint: FC<{}> = ({}) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  const [cardState, setCardState] = useState<MintingCardState>('uninitialized');
  const [chooseOption, setChooseOption] = useState<MintingChooseOption>(
    '1559-gwei',
  );

  const gasInfo = useGasInfo();

  const currentGasPrice = useMemo(() => {
    if (chooseOption === '1559-gwei') {
      return utils.parseUnits('15.59', 'gwei');
    }
    
    if (!gasInfo.data) {
      return;
    }

    if (chooseOption === 'current') {
      return utils.parseUnits(gasInfo.data.fast.toString(), 'gwei');
    }
    if (chooseOption === 'current-little-lower') {
      return utils.parseUnits(
        gasInfo.data.fast.sub(LITTLE_LOWER_DELTA).toString(),
        'gwei',
      );
    }
    if (chooseOption === 'current-more-lower') {
      return utils.parseUnits(
        gasInfo.data.fast.sub(MORE_LOWER_DELTA).toString(),
        'gwei',
      );
    }
    return undefined;
  }, [gasInfo, chooseOption]);

  return (
    <MintWrapper>
      <MintBody style={{ position: 'relative' }}>
        {cardState === 'uninitialized' && (
          <FlexCenterColumn style={{ margin: '36px 0' }}>
            <Title>
              <Bold>{blocksLeft ?? '-'}</Bold>
            </Title>
            <Text>Blocks left to mint</Text>
          </FlexCenterColumn>
        )}
        {cardState === 'choose' && (
          <>
            <FlexEnds>
              <Text>Choose a gas price:</Text>
              <A
                style={{ cursor: 'pointer' }}
                onClick={() => setCardState('uninitialized')}
              >
                Back
              </A>
            </FlexEnds>
            <MintOptionRowContainer>
              {([
                '1559-gwei',
                'current',
                'current-little-lower',
                'current-more-lower',
                'let-wallet-decide',
              ] as MintingChooseOption[]).map((c) => {
                return (
                  <MintOption
                    option={c}
                    key={`mint-option=${c}`}
                    isSelected={chooseOption === c}
                    onSelect={() => setChooseOption(c)}
                  />
                );
              })}
            </MintOptionRowContainer>
          </>
        )}
        <FlexCenterColumn>
          <A
            target={'_blank'}
            href={getTwitterShareLink(undefined, `${LONDON_EMOJI}`)}
            style={{ cursor: 'pointer' }}
          >
            Tweet {LONDON_EMOJI}
          </A>
        </FlexCenterColumn>
      </MintBody>
      {cardState === 'uninitialized' && (
        <Button onClick={() => setCardState('choose')}>MINT</Button>
      )}
      {cardState === 'choose' && <MintButton gasPriceInWei={currentGasPrice} />}
    </MintWrapper>
  );
};

const MintOption: FC<{
  option: MintingChooseOption;
  onSelect: () => void;
  isSelected?: boolean;
}> = ({ isSelected, onSelect, option }) => {
  const gasInfo = useGasInfo();

  return (
    <MintOptionRow>
      {option === 'current' && (
        <Text>
          Current gas price: {gasInfo.data?.fast.toString() ?? '-'} gwei
          {isSelected ? '*' : ''}
        </Text>
      )}
      {option === 'current-little-lower' && (
        <Text>
          Little lower:{' '}
          {gasInfo.data?.fast.sub(LITTLE_LOWER_DELTA).toString() ?? '-'} gwei
          {isSelected ? '*' : ''}
        </Text>
      )}
      {option === 'current-more-lower' && (
        <Text>
          Even lower:{' '}
          {gasInfo.data?.fast.sub(MORE_LOWER_DELTA).toString() ?? '-'} gwei
          {isSelected ? '*' : ''}
        </Text>
      )}
      {option === '1559-gwei' && (
        <Text>
          Maximize {TOKEN_SYMBOL}: 15.59 gwei{isSelected ? '*' : ''}
        </Text>
      )}
      {option === 'let-wallet-decide' && (
        <Text>Let the wallet decide: X gwei{isSelected ? '*' : ''}</Text>
      )}
      <A
        style={{ cursor: 'pointer', fontFamily: 'Computer Modern Typewriter' }}
        onClick={onSelect}
      >
        {isSelected ? '[x]' : '[-]'}
      </A>
    </MintOptionRow>
  );
};

export const MintButton: FC<{ gasPriceInWei?: BigNumber }> = ({
  gasPriceInWei,
}) => {
  const { account } = useWeb3React();
  const { txStatus, mint, error } = useMinter();

  const buttonText = useMemo(() => {
    if (!account) {
      return 'PLUG URSELF IN';
    }
    if (!!error || txStatus === 'failed') {
      if (!!gasPriceInWei) {
        return `OOF. TRY AGAIN AT ${utils.formatUnits(
          gasPriceInWei,
          'gwei',
        )} GWEI`;
      }
      return 'OOF. TRY AGAIN';
    }
    if (txStatus === 'in-progress') {
      return '';
    }
    if (txStatus === 'success') {
      return 'MINTED';
    }
    if (!!gasPriceInWei) {
      return `MINT AT ${utils.formatUnits(gasPriceInWei, 'gwei')} GWEI`;
    }
    return `MINT`;
  }, [gasPriceInWei, txStatus, error, account]);

  const isDisabled = useMemo(() => {
    return !account || txStatus === 'in-progress' || txStatus === 'success';
  }, [account, txStatus]);

  const onClick = useCallback(() => {
    mint(gasPriceInWei);
  }, [mint, gasPriceInWei]);

  const loadingText = useLoadingText();

  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const blocksLeft = useMemo(
    () => (blockNumber ? BLOCK_NUMBER_UP_TO - blockNumber : undefined),
    [blockNumber],
  );

  return (
    <Button onClick={onClick} disabled={isDisabled}>
      {txStatus === 'in-progress' ? loadingText + ' ' : ''}
      {buttonText}
    </Button>
  );
};
