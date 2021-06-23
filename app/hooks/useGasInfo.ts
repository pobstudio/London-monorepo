import { BigNumber } from 'ethers';
import useSWR from 'swr';

export interface GasInfo {
  gasPriceInWei: BigNumber;
  fast: BigNumber;
  fastest: BigNumber;
}

const getZeroExGasOracleEstimate = async (): Promise<GasInfo> => {
  const gasInfoResponse = await fetch(
    'https://gas.api.0x.org/source/median?output=eth_gas_station',
  );
  const gasInfo = await gasInfoResponse.json();
  // Eth Gas Station result is gwei * 10
  const gasFastPriceInGwei = BigNumber.from(gasInfo.fast).div(10);
  const gasFastestPriceInGwei = BigNumber.from(gasInfo.fastest).div(10);

  return {
    gasPriceInWei: gasFastPriceInGwei,
    fast: gasFastPriceInGwei,
    fastest: gasFastestPriceInGwei,
  };
};

// polls for gas price at a set interval
export const useGasInfo = () => {
  return useSWR('gas-info', getZeroExGasOracleEstimate, {
    refreshInterval: 5000,
  });
};
