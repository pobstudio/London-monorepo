import { BigNumber } from '@ethersproject/bignumber';
import { ONE_MWEI } from '.';

export const BELL_CURVE_A = BigNumber.from(15000).mul(ONE_MWEI);

export const BELL_CURVE_B = BigNumber.from(1);

export const BELL_CURVE_C = BigNumber.from(11590).mul(ONE_MWEI);

export const BELL_CURVE_D = BigNumber.from(1159);

export const SIG_DIGITS = BigNumber.from(3);
