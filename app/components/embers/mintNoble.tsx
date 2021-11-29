import { useMemo } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { FC } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { NULL_SIGNATURE } from '../../constants';
import { useLondonEmbersMinterContract } from '../../hooks/useContracts';
import { BREAKPTS } from '../../styles';
import { AirdropCheck, AirdropCheckWithAirdropState } from '../../types';
import { fetcher } from '../../utils/fetcher';
import { FlexCenter, FlexEnds } from '../flex';
import {
  Text,
  Bold,
  Title,
  Caption,
  Italic,
  MiniText,
  SmallText,
} from '../text';
import { useWeb3React } from '@web3-react/core';
import { BURN_NOBLE_AIRDROP_AMOUNT } from '../../constants/parameters';
import {
  ModalCover,
  ModalContent,
  ModalInnerContent,
  ModalDismissButton,
} from '../modal';
import { useCallback } from 'react';
import { clamp } from 'lodash';
import { useAirdropCheck } from '../../hooks/useNobleAirdrop';
import { useMintCheck } from '../../hooks/useMintCheck';
import { useTransactionsStore } from '../../stores/transaction';
import { useEmberTxStatus } from '../../hooks/useEmberTxStatus';

const ConsoleWrapper = styled(FlexCenter)`
  width: 100%;
`;

const Console = styled(FlexEnds)`
  border: 1px solid black;
  width: 450px;
  background: white;
  @media (max-width: ${BREAKPTS.MD}px) {
    width: 100%;
    grid-template-columns: minMax(0, 200px) minMax(0, 1fr);
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  border: none;
  border-left: 1px solid black;
  background: none;
  color: black;
  background: #f5f5f5;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 14px 24px;
  text-decoration: underline;
  svg {
    margin-right: 12px;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :hover {
    background: #e5e5e5;
  }
`;

const SubmitButton = styled.button`
  border: none;
  border: 1px solid black;
  background: none;
  color: black;
  background: #f5f5f5;
  width: 100%;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
  cursor: pointer;
  padding: 14px 24px;
  text-decoration: underline;
  svg {
    margin-right: 12px;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :hover {
    background: #e5e5e5;
  }
`;

const Well = styled.div`
  border: 1px solid black;
  padding: 14px;
  position: relative;
`;

const SelectedBadge = styled.div`
  background: black;
  color: white;
  text-transform: uppercase;
  font-size: 12px;
  line-height: 12px;
  position: absolute;
  padding: 8px 4px 4px 4px;
  top: 8px;
  right: 8px;
`;

const Input = styled.input`
  background: white;
  padding: 14px;
  border: 1px solid #e5e5e5;
  width: 100%;
  :focus {
    outline: none;
  }
`;

export const NobleAirdrop: FC = () => {
  const { account } = useWeb3React();
  const minter = useLondonEmbersMinterContract();
  const airdropCheck = useAirdropCheck(account ?? undefined);

  const addTransaction = useTransactionsStore((s) => s.addTransaction);

  const { tx, txStatus } = useEmberTxStatus('noble');

  const [error, setError] = useState<any | undefined>(undefined);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [optionType, setOptionType] = useState<'all' | 'variable'>('all');
  const [customValue, setCustomValue] = useState<number | undefined>(undefined);

  const claimableNumAidropped = useMemo(() => {
    if (!airdropCheck) {
      return 0;
    }
    return (
      BURN_NOBLE_AIRDROP_AMOUNT[airdropCheck.nobility] -
      (airdropCheck.numAirdropped ?? 0)
    );
  }, [airdropCheck]);

  const numChecks = useMemo(() => {
    if (optionType === 'all') {
      return claimableNumAidropped;
    }
    return customValue ?? 0;
  }, [customValue, claimableNumAidropped, optionType]);

  const mintCheck = useMintCheck(account ?? undefined, 'noble', numChecks);

  const isMintCheckReady = useMemo(() => {
    return !!mintCheck && mintCheck.uris.length == numChecks;
  }, [mintCheck, numChecks]);

  const mint = useCallback(async () => {
    if (!account || !minter || !airdropCheck || !mintCheck) {
      return;
    }
    try {
      const res = await minter.mintNobleType(
        airdropCheck.nobility,
        airdropCheck.signature,
        mintCheck,
      );

      addTransaction(res.hash, {
        tokenType: 'noble',
        type: 'embers-minting',
      });
      setError(undefined);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }, [airdropCheck, mintCheck, minter, account]);

  const onInputChange = useCallback(
    (e) => {
      if (e.target.value <= claimableNumAidropped) {
        setCustomValue(e.target.value);
      }
      if (e.target.value < 0) {
        setCustomValue(0);
      }
      if (e.target.value > claimableNumAidropped) {
        setCustomValue(claimableNumAidropped);
      }
    },
    [claimableNumAidropped],
  );

  const isClaimButtonDisabled = useMemo(() => {
    return (
      !account ||
      txStatus === 'in-progress' ||
      txStatus === 'success' ||
      !isMintCheckReady ||
      (optionType === 'variable' && !customValue) ||
      claimableNumAidropped === 0
    );
  }, [
    account,
    txStatus,
    isMintCheckReady,
    optionType,
    customValue,
    claimableNumAidropped,
  ]);

  const claimButtonText = useMemo(() => {
    if (!account) {
      return 'Plug urself in';
    }
    if (!!error || txStatus === 'failed') {
      return 'OOF. TRY AGAIN';
    }
    if (txStatus === 'in-progress') {
      return 'Claiming...';
    }
    if (txStatus === 'success') {
      return 'Claimed';
    }
    if (claimableNumAidropped === 0) {
      return 'Claimed';
    }
    if (optionType === 'variable' && !customValue) {
      return 'Specify value';
    }
    if (!isMintCheckReady) {
      return 'Generating art...';
    }

    return 'Claim';
  }, [
    account,
    txStatus,
    error,
    isMintCheckReady,
    optionType,
    customValue,
    claimableNumAidropped,
  ]);

  const modalButtonText = useMemo(() => {
    if (txStatus === 'in-progress') {
      return 'Claiming...';
    }
    if (txStatus === 'success') {
      return 'Claimed';
    }
    if (claimableNumAidropped === 0) {
      return 'Claimed!';
    }
    return 'Claim';
  }, [txStatus, optionType, customValue, claimableNumAidropped]);

  if (!airdropCheck) {
    return null;
  }

  return (
    <>
      {isClaimModalOpen && (
        <ModalCover>
          <ModalContent>
            <ModalDismissButton onClick={() => setIsClaimModalOpen(false)}>
              Dismiss
            </ModalDismissButton>
            {claimableNumAidropped === 0 && (
              <ModalInnerContent>
                <Title style={{ padding: '72px 0 72px 0' }}>
                  Claimed all EMBERs
                </Title>
              </ModalInnerContent>
            )}
            {claimableNumAidropped !== 0 && (
              <ModalInnerContent>
                <Title style={{ padding: '32px 0 24px 0' }}>Claim EMBERs</Title>
                <Well onClick={() => setOptionType('all')}>
                  <Text>
                    <Bold>
                      Claim all {claimableNumAidropped} EMBER
                      {claimableNumAidropped === 1 ? '' : 's'}
                    </Bold>
                  </Text>
                  <SmallText style={{ textAlign: 'left' }}>
                    This can be a bit gas intensive.
                  </SmallText>
                  {optionType === 'all' && (
                    <SelectedBadge>Selected</SelectedBadge>
                  )}
                </Well>
                <Well
                  onClick={() => setOptionType('variable')}
                  style={{ borderTop: 'none' }}
                >
                  <Text>
                    <Bold>Claim some EMBERS</Bold>
                  </Text>
                  <SmallText style={{ textAlign: 'left', paddingBottom: 8 }}>
                    {claimableNumAidropped} EMBER
                    {claimableNumAidropped === 1 ? ' is' : 's are'} claimable
                  </SmallText>
                  <Input
                    value={customValue ?? ''}
                    onChange={onInputChange}
                    type="number"
                    placeholder={`Choose between 1-${claimableNumAidropped}`}
                  />
                  {optionType === 'variable' && (
                    <SelectedBadge>Selected</SelectedBadge>
                  )}
                </Well>
                <SubmitButton
                  onClick={mint}
                  disabled={isClaimButtonDisabled}
                  style={{ marginTop: 14 }}
                >
                  {claimButtonText}
                </SubmitButton>
              </ModalInnerContent>
            )}
          </ModalContent>
        </ModalCover>
      )}
      <ConsoleWrapper>
        <Console>
          <Text style={{ paddingLeft: 14 }}>
            <Italic>
              Claim your{' '}
              <Bold>{BURN_NOBLE_AIRDROP_AMOUNT[airdropCheck.nobility]}</Bold>{' '}
              EMBERS!
            </Italic>
          </Text>
          <Button onClick={() => setIsClaimModalOpen((s) => !s)}>
            {modalButtonText}
          </Button>
        </Console>
      </ConsoleWrapper>
    </>
  );
};
