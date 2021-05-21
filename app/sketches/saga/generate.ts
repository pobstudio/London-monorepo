import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import {
  Bound,
  colors as defaultColors,
  labelValueWithRanges,
  lerp,
  randomRangeFactory,
  theme,
} from '../../../utils/src';
import seedrandom from 'seedrandom';
import { getTxDataFromProvider } from '../utils';
import { GeneWithTxData } from './types';

const getNumLeadingZeros = (str: string): number => {
  if (str.length === 0) {
    return 0;
  }
  return str[0] === '0' ? 1 + getNumLeadingZeros(str.slice(1)) : 0;
};

const GENE_BOUNDS = {
  gapSize: [0.003, 0.005],
  dotBounds: [0.0001, 0.004],
  pointilism: [3, 12],
  maxValueInEth: 100,
  maxNonce: 1000000,
  vectorFieldPointilism: [0.05, 25],
  maxGasPriceInGwei: 1000,
  maxCircleSize: [6, 24],
};

const GWEI = BigNumber.from('1000000000');
const ETH = BigNumber.from('1000000000000000000');
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const generateGeneFromTxData = async (
  txData: any,
  offset: number = 0,
): Promise<GeneWithTxData> => {
  const gasUsed = txData.gasUsed.toNumber();
  const gasLimit = txData.gasLimit.toNumber();
  const gapSize = lerp(
    GENE_BOUNDS.gapSize[0],
    GENE_BOUNDS.gapSize[1],
    gasUsed / gasLimit,
  );
  const dotBounds: Bound = [
    0.00003,

    lerp(
      GENE_BOUNDS.dotBounds[0],
      GENE_BOUNDS.dotBounds[1],
      gasUsed / gasLimit,
    ),
  ];
  const leadingZeros = getNumLeadingZeros(txData.hash.slice(2));
  const numCircles = leadingZeros + 2;

  const gasPriceInGwei = txData.gasPrice.div(GWEI).toNumber();
  const maxCircleSize = Math.floor(
    lerp(
      GENE_BOUNDS.maxCircleSize[0],
      GENE_BOUNDS.maxCircleSize[1],
      Math.min(gasPriceInGwei / GENE_BOUNDS.maxGasPriceInGwei, 1),
    ),
  );

  // value / constant
  const valueInEth = txData.value.div(ETH).toNumber();
  const pointilism = lerp(
    GENE_BOUNDS.pointilism[0],
    GENE_BOUNDS.pointilism[1],
    Math.min(valueInEth / GENE_BOUNDS.maxValueInEth, 1),
  );

  const address = (
    txData.to ??
    txData.contractAddress ??
    NULL_ADDRESS
  ).toLowerCase();
  const rand = seedrandom(address);
  const { randomInArray } = randomRangeFactory(rand);
  const colorsIndex = randomInArray(Object.keys(defaultColors));
  const colors = !!(theme as any)[address as string]
    ? (theme as any)[address as string].colors
    : (defaultColors[colorsIndex] as [string, string, string, string]);

  const nonce = txData.nonce;
  const compositionPointilism = lerp(
    GENE_BOUNDS.vectorFieldPointilism[0],
    GENE_BOUNDS.vectorFieldPointilism[1],
    Math.min(Math.min(nonce / GENE_BOUNDS.maxNonce, 1), 1),
  );

  const randSrc = seedrandom(txData.hash);
  const { random } = randomRangeFactory(randSrc);
  const colorSeed = random(0, 100000, 'int');

  return {
    seed: txData.hash,
    composition: {
      numCircles,
      circleRange: [2, maxCircleSize],
      pointilism: compositionPointilism,
    },
    foreground: {
      gapSize,
      dotBounds,
      pointilism,
      colors,
      colorSeed,
    },
    // txData,
    hash: txData.hash,
    blockNumber: txData.blockNumber,
    leadingZeros,
    gasPriceInGwei,
    gasUsed,
    gasLimit,
    valueInEth,
    nonce: txData.nonce,
    from: txData.from,
    to: address,
  };
};

export const generateGeneFromTxHash = async (
  provider: Provider,
  txHash: string,
  offset: number = 0,
): Promise<GeneWithTxData> => {
  const txData = await getTxDataFromProvider(provider, txHash);
  return generateGeneFromTxData(txData, offset);
};

export const generateTokenAttributesFromGene = (gene: GeneWithTxData) => {
  const textureValue =
    (gene.foreground.gapSize - GENE_BOUNDS.gapSize[1]) /
    (GENE_BOUNDS.gapSize[0] - GENE_BOUNDS.gapSize[1]);
  const textureAttribute = {
    name: 'Texture',
    value: textureValue,
    display_value: labelValueWithRanges(
      [0.25, 0.5, 0.75, 1],
      ['smooth', 'coarse', 'comic', 'fine'],
      textureValue,
    ),
  };

  const ethValue =
    (gene.foreground.pointilism - GENE_BOUNDS.pointilism[0]) /
    (GENE_BOUNDS.pointilism[1] - GENE_BOUNDS.pointilism[0]);

  const shadingAttribute = {
    name: 'Shading',
    value: ethValue,
    display_value: labelValueWithRanges(
      [0.33, 0.66, 1],
      ['basic', 'medium', 'unique'],
      ethValue,
    ),
  };

  const maxCircleSize =
    (gene.composition.circleRange[1] - GENE_BOUNDS.maxCircleSize[0]) /
    (GENE_BOUNDS.maxCircleSize[1] - GENE_BOUNDS.maxCircleSize[0]);

  const sizeAttribute = {
    name: 'Circle Size Diversity',
    value: maxCircleSize,
    display_value: labelValueWithRanges(
      [0.1, 0.4, 0.8, 1],
      ['low', 'medium', 'high', 'unique'],
      maxCircleSize,
    ),
  };

  const circlesAttribute = {
    name: 'Circles',
    value: gene.composition.numCircles,
    display_value: gene.composition.numCircles,
  };

  const complexityAttribute = {
    name: 'Complexity',
    value: gene.nonce,
    display_value: labelValueWithRanges(
      [10, 100, 500, 1000],
      ['low', 'medium', 'high', 'unique'],
      gene.nonce,
    ),
  };

  return {
    circles: circlesAttribute,
    texture: textureAttribute,
    complexity: complexityAttribute,
    circleSize: sizeAttribute,
    shading: shadingAttribute,
  };
};
