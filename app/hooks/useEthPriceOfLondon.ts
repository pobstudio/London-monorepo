import { BigNumber } from '@ethersproject/bignumber';
import { deployments } from '@pob/protocol';
import { useEffect } from 'react';
import { useState } from 'react';
import { CHAIN_ID, ZERO } from '../constants';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import { useSushiSwapRouter } from './useContracts';

const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const SLIPPAGE = 25;
const DENOMINATOR = 1000;

export const useEthPriceOfLondon = (londonAmount: BigNumber | undefined) => {
  const sushiswap = useSushiSwapRouter();
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const transactionMap = useTransactionsStore((s) => s.transactionMap);

  const [ethNeeded, setEthNeeded] = useState<BigNumber | undefined>(undefined);

  useEffect(() => {
    if (!sushiswap) {
      return;
    }
    if (!londonAmount) {
      setEthNeeded(undefined);
      return;
    }
    sushiswap
      .getAmountsIn(londonAmount, [WETH_ADDRESS, deployments[CHAIN_ID].erc20])
      .then((b) => {
        setEthNeeded(
          b[0].add(b[0].mul(DENOMINATOR).div(SLIPPAGE).div(DENOMINATOR)),
        );
      });
  }, [londonAmount, transactionMap, blockNumber]);

  return ethNeeded;
};
