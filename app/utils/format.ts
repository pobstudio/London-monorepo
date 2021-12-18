import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export const formatBigNumberSafe = (numberish: BigNumberish) => {
  try {
    return BigNumber.from(numberish);
  } catch (e) {
    return undefined;
  }
};

export const lowerCaseCheck = (
  a: string | undefined | null,
  b: string | undefined | null,
) => a && b && a?.toLowerCase()?.includes(b?.toLowerCase());
