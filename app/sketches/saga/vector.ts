import seedrandom from 'seedrandom';

import { Cord, Vec2, newArray, randomRangeFactory } from '../../../utils/src';

const OP_WEIGHTS: { [op: string]: number } = {
  sin: 0.05,
  cos: 0.05,
  identity: 0.15,
  mul: 0.1,
  div: 0.1,
  add: 0.1,
  sub: 0.1,
  min: 0.05,
  max: 0.05,
  log: 0.0,
  exp: 0.025,
  pow: 0.1,
  abs: 0.05,
  len: 0.075,
};

const MAX_DEPTH = 4;

type OpCode =
  | 'sin'
  | 'cos'
  | 'identity'
  | 'mul'
  | 'div'
  | 'add'
  | 'sub'
  | 'min'
  | 'max'
  | 'log'
  | 'exp'
  | 'pow'
  | 'abs'
  | 'len';

type OpType = 'double' | 'single' | 'identity';

interface Op {
  code: OpCode;
  type: OpType;
}

interface DoubleOp extends Op {
  type: 'double';
  a: Op;
  b: Op;
}

interface SingleOp extends Op {
  type: 'single';
  a: Op;
}

interface IdentityOp extends Op {
  type: 'identity';
  index: number;
}

export const randomVectorFieldBySeed = (seed: string) => {
  const randSrc = seedrandom(seed);
  const { randomInArrayByWeights } = randomRangeFactory(randSrc);

  const randomOpCode = () =>
    randomInArrayByWeights(
      Object.keys(OP_WEIGHTS),
      Object.keys(OP_WEIGHTS).map((k) => OP_WEIGHTS[k]),
    ) as OpCode;

  const createOp = (depth: number = 0): Op => {
    const opCode = depth > MAX_DEPTH ? 'identity' : randomOpCode();
    if (
      opCode === 'sin' ||
      opCode === 'cos' ||
      opCode === 'log' ||
      opCode === 'exp' ||
      opCode === 'pow' ||
      opCode === 'abs'
    ) {
      return {
        type: 'single',
        code: 'sin',
        a: createOp(depth + 1),
      } as SingleOp;
    }
    if (
      opCode === 'mul' ||
      opCode === 'div' ||
      opCode === 'add' ||
      opCode === 'sub' ||
      opCode === 'min' ||
      opCode === 'max'
    ) {
      return {
        type: 'double',
        code: opCode,
        a: createOp(depth + 1),
        b: createOp(depth + 1),
      } as DoubleOp;
    }
    if (opCode === 'len') {
      return {
        type: 'double',
        code: opCode,
        a: {
          type: 'identity',
          code: 'identity',
          index: 0,
        } as IdentityOp,
        b: {
          type: 'identity',
          code: 'identity',
          index: 1,
        } as IdentityOp,
      } as DoubleOp;
    }
    return {
      type: 'identity',
      code: opCode,
      index: randSrc() < 0.5 ? 0 : 1,
    } as IdentityOp;
  };

  const xOp = createOp();
  const yOp = createOp();

  return (cord: Cord): Vec2 => {
    const applyOp = (op: Op): number => {
      if (op.type === 'double') {
        if (op.code === 'len') {
          return Math.sqrt(cord[0] ** 2 + cord[1] ** 2);
        }
        if (op.code === 'mul') {
          return applyOp((op as DoubleOp).a) * applyOp((op as DoubleOp).b);
        }
        if (op.code === 'div') {
          const divisor = applyOp((op as DoubleOp).b);
          if (divisor === 0) {
            return 0;
          }
          return applyOp((op as DoubleOp).a) / divisor;
        }
        if (op.code === 'add') {
          return applyOp((op as DoubleOp).a) + applyOp((op as DoubleOp).b);
        }
        if (op.code === 'sub') {
          return applyOp((op as DoubleOp).a) - applyOp((op as DoubleOp).b);
        }
        if (op.code === 'min') {
          return Math.min(
            applyOp((op as DoubleOp).a),
            applyOp((op as DoubleOp).b),
          );
        }
        if (op.code === 'max') {
          return Math.max(
            applyOp((op as DoubleOp).a),
            applyOp((op as DoubleOp).b),
          );
        }
      }
      if (op.type === 'single') {
        if (op.code === 'sin') {
          return Math.sin(applyOp((op as SingleOp).a));
        }
        if (op.code === 'cos') {
          return Math.cos(applyOp((op as SingleOp).a));
        }
        // if (op.code === 'log') {
        //   return Math.log(applyOp((op as SingleOp).a))
        // }
        if (op.code === 'exp') {
          return Math.exp(applyOp((op as SingleOp).a));
        }
        if (op.code === 'pow') {
          return Math.pow(applyOp((op as SingleOp).a), 2);
        }
        if (op.code === 'abs') {
          return Math.abs(applyOp((op as SingleOp).a));
        }
      }
      return cord[(op as IdentityOp).index];
    };

    return [applyOp(xOp), applyOp(yOp)];
  };
};
