import { BigNumber } from '@ethersproject/bignumber';
import { FC, useCallback, useMemo, useState } from 'react';
import {
  ONE_GWEI,
  ONE_MWEI,
  ONE_TOKEN_IN_BASE_UNITS,
  ZERO,
} from '../constants';
import { bellCurve } from '../utils/bellcurve';
import { utils } from 'ethers';
import { scaleLinear } from '@visx/scale';
import { BELL_CURVE_D } from '../constants/parameters';
import { Bar, LinePath, Line, AreaClosed } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { localPoint } from '@visx/event';
import styled from 'styled-components';

export interface BellCurveProps {
  width: number;
  height: number;
}

const BellCurveContainer = styled.div`
  position: relative;
`;

type Datum = [number, number];

const getData = () => {
  const data: Datum[] = [];
  for (let i = DOMAIN[0]; i.lt(DOMAIN[1]); i = i.add(GRAPH_FIDELITY)) {
    data.push([
      parseFloat(utils.formatUnits(i, 'gwei')),
      parseFloat(utils.formatUnits(bellCurve(i), 'ether')),
    ]);
  }
  return data;
};

export const MARGIN = {
  top: 5,
  bottom: 0,
  right: 5,
  left: 5,
};
export const PERCENTAGE_BOTTOM_BUFFER = 0.5;
// DOMAIN of bell curve in wei [0, 1000 GWEI]
export const DOMAIN = [ZERO, BigNumber.from(250).mul(ONE_GWEI)];
// RANGE of bell curve in base unit [0, 1559E18 TOKENS]
export const RANGE = [ZERO, BELL_CURVE_D.mul(ONE_TOKEN_IN_BASE_UNITS)];

export const GRAPH_FIDELITY = BigNumber.from(1).mul(ONE_GWEI);

// x in gwei, y in unit amount of TOKEN

export const BellCurve: FC<BellCurveProps> = (props) => {
  const { width, height } = props;

  const data = useMemo(() => getData(), []);

  const percentageBufferHeight = useMemo(
    () => PERCENTAGE_BOTTOM_BUFFER * height,
    [height],
  );

  const xScale = useMemo(
    () =>
      scaleLinear({
        range: [MARGIN.left, width - MARGIN.right],
        domain: [
          parseFloat(utils.formatUnits(DOMAIN[0], 'gwei')),
          parseFloat(utils.formatUnits(DOMAIN[1], 'gwei')),
        ],
      }),
    [width],
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [height - percentageBufferHeight, MARGIN.top],
        domain: [
          parseFloat(utils.formatUnits(RANGE[0], 'ether')),
          parseFloat(utils.formatUnits(RANGE[1], 'ether')),
        ],
      }),
    [width, percentageBufferHeight],
  );

  const [isTooltipShown, setIsTooltipShown] = useState(false);
  const [tooltipDatum, setTooltipDatum] = useState<Datum | undefined>(
    undefined,
  );
  const [tooltipX, setTooltipX] = useState<number | undefined>(undefined);

  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>,
    ) => {
      const { x } = localPoint(event) || { x: 0 };

      if (x < 0 || x > width) {
        return;
      }
      const invertX = xScale.invert(x);
      const index = Math.floor(invertX);
      setTooltipDatum(data[index]);
      if (!isTooltipShown) {
        setIsTooltipShown(true);
      }
      // setTooltipX(x);
    },
    [xScale, data, isTooltipShown],
  );

  return (
    <BellCurveContainer>
      <svg
        onTouchStart={handleTooltip}
        onTouchMove={handleTooltip}
        onMouseMove={handleTooltip}
        onMouseLeave={() => setIsTooltipShown(false)}
        width={width}
        height={height}
      >
        <LinearGradient
          id="area-gradient-0"
          from={'#FFFFFF'}
          to={'#FFFFFF'}
          fromOpacity={0.3}
          toOpacity={0.1}
        />
        <LinearGradient
          id="area-gradient-1"
          from={'#FFFFFF'}
          to={'#FFFFFF'}
          fromOpacity={0.1}
          toOpacity={0.0}
        />
        <AreaClosed<Datum>
          data={data}
          x={(d) => xScale(d[0]) ?? 0}
          y={(d) => yScale(d[1]) ?? 0}
          yScale={yScale}
          strokeWidth={0}
          stroke="white"
          fill="url(#area-gradient-0)"
          curve={curveMonotoneX}
        />
        <Bar
          x={MARGIN.left}
          y={height - percentageBufferHeight}
          width={width - MARGIN.left - MARGIN.right}
          height={percentageBufferHeight}
          fill="url(#area-gradient-1)"
        />
        <LinePath<Datum>
          stroke={'white'}
          strokeWidth={2}
          data={data}
          strokeOpacity={1}
          x={(d) => xScale(d[0]) ?? 0}
          y={(d) => yScale(d[1]) ?? 0}
          curve={curveMonotoneX}
        />
        {isTooltipShown && tooltipDatum && (
          <g>
            <Line
              from={{ x: xScale(tooltipDatum[0]), y: height }}
              to={{ x: xScale(tooltipDatum[0]), y: yScale(tooltipDatum[1]) }}
              stroke={'white'}
              strokeOpacity={0.2}
              strokeWidth={1}
              pointerEvents="none"
              strokeDasharray="4,2"
            />
            <circle
              cx={xScale(tooltipDatum[0])}
              cy={yScale(tooltipDatum[1])}
              r={4}
              fill="black"
              fillOpacity={1}
              stroke="white"
              strokeOpacity={1}
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
    </BellCurveContainer>
  );
};
