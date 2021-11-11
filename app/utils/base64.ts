/*
 * Check if global object window is defined
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}

/*
 * Decode base64 value, returns string
 * @Params: string
 */
export function decodeValue(value: string) {
  if (!value) {
    return null;
  }

  const valueToString = value.toString();

  if (isBrowser()) {
    return btoa(valueToString);
  }

  const buff = Buffer.from(valueToString, 'ascii');
  return buff.toString('base64');
}

/*
 * Encode string, returns base64 value
 * @Params: string
 */
export function encodeValue(value: string) {
  if (!value) {
    return null;
  }

  const valueToString = value.toString();

  if (isBrowser()) {
    return atob(valueToString);
  }

  const buff = Buffer.from(valueToString, 'base64');
  return buff.toString('ascii');
}