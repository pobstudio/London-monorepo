import { useMemo } from 'react';
import { useState } from 'react';
import { useInterval } from 'react-use';

// export const TEXT = ['|', '/', '─', '\\', '|', '/', '─', '\\'];
export const TEXT = ['|', '/', '─', '\\'];

export const useLoadingText = () => {
  const [counter, setState] = useState(0);
  useInterval(() => {
    setState(counter + 1);
  }, 100);
  return useMemo(() => TEXT[counter % TEXT.length], [counter]);
};
