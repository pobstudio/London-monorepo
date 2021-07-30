import { BigNumber } from '@ethersproject/bignumber';
import { ONE_MWEI, ONE_TOKEN_IN_BASE_UNITS } from '.';

export const BELL_CURVE_A = BigNumber.from(6000).mul(ONE_MWEI);

export const BELL_CURVE_B = BigNumber.from(1);

export const BELL_CURVE_C = BigNumber.from(15590).mul(ONE_MWEI);

export const BELL_CURVE_D = BigNumber.from(1559);

export const SIG_DIGITS = BigNumber.from(3);

export const BLOCK_NUMBER_UP_TO = 12965000;

export const BLOCK_NUMBER_MINT_START_AT = 12965000;

export const BLOCK_NUMBER_REVEAL_START_AT =
  BLOCK_NUMBER_MINT_START_AT + BLOCK_NUMBER_UP_TO * 1.5;

export const MINT_PRICE = ONE_TOKEN_IN_BASE_UNITS.mul(1559);

export const MAX_SUPPLY = 8888;

export const MAX_MINT_PER_TX = 20;
