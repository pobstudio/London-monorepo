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

const ConsoleWrapper = styled(FlexCenter)`
  width: 100%;
`;

const Console = styled(FlexEnds)`
  border: 1px solid black;
  width: 800px;
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
`;

const ClickableWell = styled(Well)`
  :hover {
    background: #e5e5e5;
  }
  border: 1px solid black;
  padding: 14px;
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

const useAirdropCheck = (address: string | undefined) => {
  const minter = useLondonEmbersMinterContract();
  const { data } = useSWR(
    useMemo(() => (!!address ? `/api/airdrop?to=${address}` : null), [address]),
    fetcher,
  );
  const [numAirdropReceived, setNumAirdropReceived] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (!address) {
      return;
    }
    if (!minter) {
      return;
    }
    minter.receivedAirdropNum(address).then((b) => {
      console.log('b', b);
      setNumAirdropReceived(b.toNumber());
    });
  }, [address, minter]);

  return useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (data.signature === NULL_SIGNATURE) {
      return undefined;
    }
    if (
      !!numAirdropReceived &&
      numAirdropReceived >= BURN_NOBLE_AIRDROP_AMOUNT[data.nobility]
    ) {
      return undefined;
    }
    return {
      nobility: data.nobility,
      to: data.to,
      signature: data.signature,
      numAirdropped: numAirdropReceived,
    } as AirdropCheckWithAirdropState;
  }, [data, numAirdropReceived]);
};

export const NobleAirdrop: FC = () => {
  const { account } = useWeb3React();
  const airdropCheck = useAirdropCheck(
    '0x4a36c3da5d367b148d17265e7d7feafcf8fb4a21' ?? undefined,
  );
  console.log(airdropCheck);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

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
            <ModalInnerContent>
              <Title style={{ padding: '32px 0 24px 0' }}>Claim EMBERS</Title>
              <ClickableWell>
                <Text>
                  <Bold>
                    Claim all {BURN_NOBLE_AIRDROP_AMOUNT[airdropCheck.nobility]}{' '}
                    EMBERS
                  </Bold>
                </Text>
                <SmallText style={{ textAlign: 'left' }}>
                  This can be a bit gas intensive.
                </SmallText>
              </ClickableWell>
              <Well style={{ borderTop: 'none' }}>
                <Text>
                  <Bold>Claim some of the EMBERS</Bold>
                </Text>
                <SmallText style={{ textAlign: 'left', paddingBottom: 8 }}>
                  7 of {BURN_NOBLE_AIRDROP_AMOUNT[airdropCheck.nobility]} EMBERS
                  already claimed.
                </SmallText>
                <Input type="text" placeholder={'4'} />
              </Well>
              <SubmitButton style={{ marginTop: 14 }}>Claim</SubmitButton>
            </ModalInnerContent>
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
          <Button onClick={() => setIsClaimModalOpen((s) => !s)}>Claim</Button>
        </Console>
      </ConsoleWrapper>
    </>
  );
};
