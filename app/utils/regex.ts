import { MAX_TOKEN_ID } from '../constants/parameters';

export const ADDRESS_REGEX = /^0x([A-Fa-f0-9]{40})$/;
export const TX_HASH_REGEX = /^0x([A-Fa-f0-9]{64})$/;

export const GIFT_TOKEN_ID_VALID = (tokenID: number): boolean =>
  0 <= tokenID && tokenID <= MAX_TOKEN_ID;
