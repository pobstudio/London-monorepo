import { BigNumber } from '@ethersproject/bignumber';
import { BLOCKS_PER_24_HRS, ONE_MWEI, ONE_TOKEN_IN_BASE_UNITS } from '.';

export const BELL_CURVE_A = BigNumber.from(6000).mul(ONE_MWEI);

export const BELL_CURVE_B = BigNumber.from(1);

export const BELL_CURVE_C = BigNumber.from(15590).mul(ONE_MWEI);

export const BELL_CURVE_D = BigNumber.from(1559);

export const SIG_DIGITS = BigNumber.from(3);

export const BLOCK_NUMBER_UP_TO = 12965000;

export const BLOCK_NUMBER_MINT_START_AT = 12965000;

export const BLOCK_NUMBER_UNLOCK_START_AT =
  BLOCK_NUMBER_MINT_START_AT + BLOCKS_PER_24_HRS * 0.5;

export const BLOCK_NUMBER_REVEAL_START_AT =
  BLOCK_NUMBER_MINT_START_AT + BLOCKS_PER_24_HRS * 1.5;

export const MINT_PRICE = ONE_TOKEN_IN_BASE_UNITS.mul(1559);

export const MAX_SUPPLY = 8888;

export const MAX_TOKEN_ID = MAX_SUPPLY - 1;

export const MAX_MINT_PER_TX = 10;

export const MAX_MINT_NOT_UNLOCKED = 1;

export const STARTING_INDEX = 3655;

export const TOKEN_TYPES: { [key: string]: string } = {
  noble: '0x8000000000000000000000000000000100000000000000000000000000000000',
  gift: '0x8000000000000000000000000000000200000000000000000000000000000000',
  pristine:
    '0x8000000000000000000000000000000300000000000000000000000000000000',
  eternal: '0x8000000000000000000000000000000400000000000000000000000000000000',
  ashen: '0x8000000000000000000000000000000500000000000000000000000000000000',
  ultrasonic:
    '0x8000000000000000000000000000000600000000000000000000000000000000',
};

export type TokenType = keyof typeof TOKEN_TYPES;

// burn paramters
export const BURN_ULTRASONIC_BLOCK = BigNumber.from(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
);
export const BURN_REVEAL_BLOCK = BigNumber.from(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
);

// PRISTINE

export const BURN_PRISTINE_MINTABLE_SUPPLY = 500;
export const BURN_PRICE_PER_PRISTINE_MINT = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
export const BURN_MAX_PRISTINE_AMOUNT_PER_MINT = 4;
export const BURN_ETERNAL_MINTABLE_SUPPLY = BigNumber.from(100);

// NOBLE
export const BURN_AIDROP_FEE = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
export const BURN_NOBLE_AIRDROP_AMOUNT: { [e: number]: number } = {
  0: 0,
  1: 2,
  2: 5,
  3: 16,
};
export const BURN_NOBLE_AIRDROP_AMOUNT_REVERSE_LOOKUP: {
  [e: number]: number;
} = {
  0: 0,
  2: 1,
  5: 2,
  16: 3,
};

// GIFTS
export const BURN_MIN_MAX_AMOUNT_FOR_GIFTS = [2, 15];
export const BURN_MAX_AMOUNT_GIFTS = 1559;
export const BURN_LONDON_FEE_FOR_GIFTS: { [key: number]: BigNumber } = {
  2: ONE_TOKEN_IN_BASE_UNITS.mul(3375),
  3: ONE_TOKEN_IN_BASE_UNITS.mul(4629),
  4: ONE_TOKEN_IN_BASE_UNITS.mul(5359),
  5: ONE_TOKEN_IN_BASE_UNITS.mul(5832),
  6: ONE_TOKEN_IN_BASE_UNITS.mul(6162),
  7: ONE_TOKEN_IN_BASE_UNITS.mul(6405),
  8: ONE_TOKEN_IN_BASE_UNITS.mul(6591),
  9: ONE_TOKEN_IN_BASE_UNITS.mul(6739),
  10: ONE_TOKEN_IN_BASE_UNITS.mul(6859),
  11: ONE_TOKEN_IN_BASE_UNITS.mul(6958),
  12: ONE_TOKEN_IN_BASE_UNITS.mul(7041),
  13: ONE_TOKEN_IN_BASE_UNITS.mul(7111),
  14: ONE_TOKEN_IN_BASE_UNITS.mul(7173),
  15: ONE_TOKEN_IN_BASE_UNITS.mul(7226),
};

// ASHEN
export const BURN_MIN_MAX_AMOUNT_FOR_SELF = [3, 7];
export const BURN_BASE_LONDON_FEE_FOR_SELF = ONE_TOKEN_IN_BASE_UNITS.mul(1559);
export const BURN_LONDON_FEE_FOR_SELF: { [key: number]: BigNumber } = {
  3: BURN_BASE_LONDON_FEE_FOR_SELF.mul(3),
  4: BURN_BASE_LONDON_FEE_FOR_SELF.mul(4),
  5: BURN_BASE_LONDON_FEE_FOR_SELF.mul(5),
  6: BURN_BASE_LONDON_FEE_FOR_SELF.mul(6),
  7: BURN_BASE_LONDON_FEE_FOR_SELF.mul(7),
};
