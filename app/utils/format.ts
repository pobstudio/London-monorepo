import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export const formatBigNumberSafe = (numberish: BigNumberish) => {
  try {
    return BigNumber.from(numberish);
  } catch (e) {
    return undefined;
  }
};
