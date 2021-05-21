require('dotenv').config();

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: `TODO`,
  output: {
    dir: `out/${season}`,
    format: 'cjs',
  },
  plugins: [
    typescript({
      tsconfig: './rollup.tsconfig.json',
    }),
    // nodeResolve({
    //   resolveOnly: ['simplex-noise', 'seedrandom', 'lodash/clamp', '@ethersproject/bignumber', 'lodash/flatten', 'lodash/find', ],
    // }),
    json(),
    commonjs(),
    terser(),
  ],
};
