import { getAddress } from '@ethersproject/address';
import { AlchemyProvider } from '@ethersproject/providers';
import {
  deployments,
  Multicall__factory,
  ERC1155Mintable__factory,
} from '@pob/protocol';
import { BigNumber, ethers } from 'ethers';
import { fromPairs } from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'path';
import {
  ALCHEMY_KEY,
  CHAIN_ID,
  DRAW_ALCHEMY_KEY,
  NULL_ADDRESS,
  ZERO,
} from '../../constants';

const provider = new AlchemyProvider(CHAIN_ID, ALCHEMY_KEY);

const erc1155 = ERC1155Mintable__factory.connect(
  deployments[CHAIN_ID].erc1155,
  provider,
);
const multiCall = Multicall__factory.connect(
  deployments[CHAIN_ID].multicall,
  provider,
);

const pruneUintToAddress = (uint: string) => {
  return `0x${uint.slice(-40)}`;
};

const handleOwner = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenIds } = req.query;

  if (typeof tokenIds !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'tokenId is not a valid value' });
    return;
  }

  const tokenIdsArr = tokenIds.split(',');
  const calls = tokenIdsArr
    .map((id) => erc1155.interface.encodeFunctionData('ownerOf', [id]))
    .map((callData) => ({
      target: erc1155.address,
      callData,
    }));

  const callRes = await multiCall.callStatic.aggregate(calls);

  const ownerEntries = tokenIdsArr
    .map((id: string, i: number) => {
      return [id, pruneUintToAddress(callRes[1][i])];
    })
    .filter(([id, owner]) => owner != NULL_ADDRESS);

  if (ownerEntries.length == 0) {
    res.status(200).json({
      statusCode: 200,
      owners: {},
    });
    return;
  }

  res.status(200).json({
    statusCode: 200,
    owners: fromPairs(ownerEntries),
  });
};

export default handleOwner;
