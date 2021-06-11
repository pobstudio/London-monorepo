import { BigNumber } from '@ethersproject/bignumber';
import { ONE_MWEI } from '.';

export const BELL_CURVE_A = BigNumber.from(6000).mul(ONE_MWEI);

export const BELL_CURVE_B = BigNumber.from(1);

export const BELL_CURVE_C = BigNumber.from(15590).mul(ONE_MWEI);

export const BELL_CURVE_D = BigNumber.from(1559);

export const SIG_DIGITS = BigNumber.from(3);

// TENETATIVE VALUE
export const BLOCK_NUMBER_UP_TO = 12833000;
