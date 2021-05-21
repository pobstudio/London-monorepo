import { useEffect } from 'react';
import { useState } from 'react';
import { usePrevious } from 'react-use';

export const useLastTruthyValue = <T>(value: T) => {
  const [truthyValue, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    if (!!value) {
      setValue(value);
    }
  }, [value]);

  return truthyValue;
};
