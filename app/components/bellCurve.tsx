import { BigNumber } from '@ethersproject/bignumber';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ONE_GWEI,
  ONE_MWEI,
  ONE_TOKEN_IN_BASE_UNITS,
  TOKEN_SYMBOL,
  ZERO,
} from '../constants';
import { bellCurve } from '../utils/bellcurve';
import { utils } from 'ethers';
import { scaleLinear } from '@visx/scale';
import { BELL_CURVE_C, BELL_CURVE_D } from '../constants/parameters';
import { Bar, LinePath, Line, AreaClosed } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { localPoint } from '@visx/event';
import styled from 'styled-components';
import { clamp } from 'lodash';
import { AxisLeft, AxisBottom } from '@visx/axis';

export interface BellCurveProps {
  width: number;
  height: number;
  onTooltip?: (data: Datum | undefined) => void;
}

const BellCurveContainer = styled.div`
  position: relative;
  margin: 32px 0 20px 0;
`;

export type Datum = [number, number];

const getData = () => {
  const data: Datum[] = [];
  for (let i = DOMAIN[0]; i.lt(DOMAIN[1]); i = i.add(GRAPH_FIDELITY)) {
    if (i.eq(BigNumber.from(16).mul(ONE_GWEI))) {
      data.push([
        parseFloat(utils.formatUnits(BELL_CURVE_C, 'gwei')),
        parseFloat(utils.formatUnits(bellCurve(BELL_CURVE_C), 'ether')),
      ]);
    } else {
      data.push([
        parseFloat(utils.formatUnits(i, 'gwei')),
        parseFloat(utils.formatUnits(bellCurve(i), 'ether')),
      ]);
    }
  }
  return data;
};

export const MARGIN = {
  top: 5,
  bottom: 25,
  right: 10,
  left: 36,
};

export const PERCENTAGE_BOTTOM_BUFFER = 0;
// DOMAIN of bell curve in wei [0, 1000 GWEI]
export const DOMAIN = [ZERO, BigNumber.from(200).mul(ONE_GWEI)];
// RANGE of bell curve in base unit [0, 1559E18 TOKENS]
export const RANGE = [ZERO, BELL_CURVE_D.mul(ONE_TOKEN_IN_BASE_UNITS)];

export const GRAPH_FIDELITY = BigNumber.from(1).mul(ONE_GWEI);

const DEFAULT_DATUM: Datum = [
  parseFloat(utils.formatUnits(BELL_CURVE_C, 'gwei')),
  parseFloat(utils.formatUnits(bellCurve(BELL_CURVE_C), 'ether')),
];

const TOOLTIP_WIDTH = 160;
// x in gwei, y in unit amount of TOKEN

export const BellCurve: FC<BellCurveProps> = (props) => {
  const { width, height, onTooltip } = props;

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
        range: [height - MARGIN.bottom, MARGIN.top],
        domain: [
          parseFloat(utils.formatUnits(RANGE[0], 'ether')),
          parseFloat(utils.formatUnits(RANGE[1], 'ether')),
        ],
      }),
    [width],
  );

  const [isTooltipShown, setIsTooltipShown] = useState(true);
  const [tooltipDatum, setTooltipDatum] = useState<Datum | undefined>(
    DEFAULT_DATUM,
  );

  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>,
    ) => {
      const { x } = localPoint(event) || { x: 0 };

      if (x < 0 || x > width) {
        return;
      }
      const clampX = clamp(x, MARGIN.left, width - MARGIN.right - 1);
      const invertX = xScale.invert(clampX);
      const index = Math.floor(invertX);
      setTooltipDatum(data[index]);
      if (!isTooltipShown) {
        setIsTooltipShown(true);
      }
      // setTooltipX(x);
    },
    [xScale, data, isTooltipShown],
  );

  useEffect(() => {
    onTooltip?.(tooltipDatum);
  }, [tooltipDatum, onTooltip]);

  return (
    <BellCurveContainer>
      <svg
        onTouchStart={handleTooltip}
        onTouchMove={handleTooltip}
        onMouseMove={handleTooltip}
        onMouseLeave={() => {}}
        width={width}
        height={height}
      >
        <LinearGradient
          id="area-gradient-0"
          from={'#000000'}
          to={'#000000'}
          fromOpacity={0.4}
          toOpacity={0.1}
        />
        <LinearGradient
          id="area-gradient-1"
          from={'#000000'}
          to={'#000000'}
          fromOpacity={0.1}
          toOpacity={0.0}
        />
        <AxisLeft
          tickStroke={'#dddddd'}
          tickLength={4}
          left={MARGIN.left}
          scale={yScale}
        />
        <AxisBottom
          tickStroke={'#dddddd'}
          tickLength={4}
          top={height - MARGIN.bottom}
          scale={xScale}
        />
        <text
          x="-90"
          y={MARGIN.left + 10}
          transform="rotate(-90)"
          fontSize={10}
        >
          {TOKEN_SYMBOL} Minted
        </text>
        <text x={width - 80} y={height - MARGIN.bottom - 6} fontSize={10}>
          Gas Price (gwei)
        </text>
        {/* <AreaClosed<Datum>
          data={data}
          x={(d) => xScale(d[0]) ?? 0}
          y={(d) => yScale(d[1]) ?? 0}
          yScale={yScale}
          strokeWidth={0}
          stroke="white"
          fill="url(#area-gradient-0)"
          curve={curveMonotoneX}
        /> */}
        {/* <Bar
          x={MARGIN.left}
          y={height - percentageBufferHeight}
          width={width - MARGIN.left - MARGIN.right}
          height={percentageBufferHeight}
          fill="url(#area-gradient-1)"
        /> */}
        <LinePath<Datum>
          stroke={'#0000FF'}
          strokeWidth={1}
          data={data}
          strokeOpacity={1}
          x={(d) => xScale(d[0]) ?? 0}
          y={(d) => yScale(d[1]) ?? 0}
          curve={curveMonotoneX}
        />
        {isTooltipShown && tooltipDatum && (
          <g>
            <Line
              from={{ x: xScale(tooltipDatum[0]), y: height - MARGIN.bottom }}
              to={{ x: xScale(tooltipDatum[0]), y: yScale(tooltipDatum[1]) }}
              stroke={'#000000'}
              strokeOpacity={0.2}
              strokeWidth={1}
              pointerEvents="none"
              // strokeDasharray="4,2"
            />
            <circle
              cx={xScale(tooltipDatum[0])}
              cy={yScale(tooltipDatum[1]) + 1}
              r={5}
              fill="black"
              fillOpacity={0.3}
              strokeWidth={0}
              pointerEvents="none"
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
      {isTooltipShown && tooltipDatum && (
        <>
          <TooltipTopWell>
            <TooltipLabel style={{ opacity: 1 }}>
              X: {tooltipDatum[0]} gwei
            </TooltipLabel>
            <TooltipLabel style={{ opacity: 1 }}>
              Y: {tooltipDatum[1]} {TOKEN_SYMBOL}
            </TooltipLabel>
          </TooltipTopWell>
        </>
      )}
    </BellCurveContainer>
  );
};

const TooltipLabel = styled.p`
  font-size: 14px;
  color: black;
  opacity: 1;
  font-weight: 500;
  margin: 0;
`;

const TooltipTopWell = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  border: 1px solid black;
  background: white;
  padding: 4px;
`;
