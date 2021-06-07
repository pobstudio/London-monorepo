import { BigNumber } from '@ethersproject/bignumber';
import { FC } from 'react';
import { ONE_GWEI, ONE_MWEI, ZERO } from '../constants';
import { bellCurve } from '../utils/bellcurve';
import { utils } from 'ethers';

export interface BellCurveProps {
  width: number;
  height: number;
}

const getData = () => {
  const x: number[] = [];
  const y: number[] = [];
  for (let i = DOMAIN[0]; i <= DOMAIN[1]; i.add(GRAPH_FIDELITY)) {
    x.push(parseFloat(utils.formatUnits(i, 'wei')));
    y.push(parseFloat(utils.formatUnits(bellCurve(i), 'ether')));
  }
  return [x, y];
};
// DOMAIN of bell curve in wei [0, 1000 GWEI]
export const DOMAIN = [ZERO, BigNumber.from(1000).mul(ONE_GWEI)];

export const GRAPH_FIDELITY = BigNumber.from(1).mul(ONE_GWEI);

// x in gwei, y in unit amount of TOKEN
export const DATA = getData();

export const BellCurve: FC<BellCurveProps> = (props) => {
  const { width, height } = props;

  console.log(
    'bellCurve',
    bellCurve(BigNumber.from(46360).mul(ONE_MWEI)).toString(),
  );
  return (
    <div>
      <svg width={width} height={height}></svg>
    </div>
  );
};
