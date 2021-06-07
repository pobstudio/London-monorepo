import { BigNumber } from '@ethersproject/bignumber';
import {
  BELL_CURVE_A,
  BELL_CURVE_B,
  BELL_CURVE_C,
  BELL_CURVE_D,
  SIG_DIGITS,
} from '../constants/parameters';

// a ts copy of the bell curve function

const DECIMALS = BigNumber.from(10).pow(SIG_DIGITS);

export const bellCurve = (x: BigNumber): BigNumber => {
  const xDiffC = x.gt(BELL_CURVE_C) ? x.sub(BELL_CURVE_C) : BELL_CURVE_C.sub(x);
  const numerator = BigNumber.from(BELL_CURVE_D).mul(DECIMALS).mul(DECIMALS);
  const xDiffCDivAPower = BigNumber.from(
    BigNumber.from(xDiffC.mul(DECIMALS)).div(BELL_CURVE_A),
  )
    .pow(BELL_CURVE_B.mul(2))
    .div(DECIMALS);
  const denominator = DECIMALS.add(xDiffCDivAPower);
  return BigNumber.from(10)
    .pow(BigNumber.from(18).sub(SIG_DIGITS))
    .mul(numerator.div(denominator));
};
