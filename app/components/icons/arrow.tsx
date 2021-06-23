import { FC } from 'react';

export const Arrow: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="54"
      height="14"
      viewBox="0 0 27 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.5161 0L22.9021 0.616875L25.3321 3.0625H0V3.9375H25.3321L22.9021 6.38313L23.5161 7L27 3.5L23.5161 0Z"
        fill="white"
      />
    </svg>
  );
};
