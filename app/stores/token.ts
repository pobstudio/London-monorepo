import create from 'zustand';
import produce from 'immer';
import { BigNumber } from '@ethersproject/bignumber';
import { ZERO } from '../constants';

type State = {
  approvalBalance: BigNumber;
  tokenBalance: BigNumber;
  setApprovalBalance: (approvalBalance: BigNumber) => void;
  setTokenBalance: (tokenBalance: BigNumber) => void;
};

export const useTokensStore = create<State>((set, get) => ({
  approvalBalance: ZERO,
  tokenBalance: ZERO,
  setTokenBalance: (tokenBalance: BigNumber) => {
    set(
      produce((s) => {
        s.tokenBalance = tokenBalance;
      }),
    );
  },
  setApprovalBalance: (approvalBalance: BigNumber) => {
    set(
      produce((s) => {
        s.approvalBalance = approvalBalance;
      }),
    );
  },
}));
