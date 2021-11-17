require('dotenv').config();

import { BigNumber, ethers, utils } from 'ethers';
import { writeFile, readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { ERC721__factory } from '@pob/protocol';
import seed from 'seedrandom';
import { randomRangeFactory } from '@pob/common';
import { AlchemyProvider } from '@ethersproject/providers';
import { graphQlFetcher } from './utils/fetcher';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? '';
const provider = new AlchemyProvider(1, ALCHEMY_API_KEY);

const CSV_PATH = resolve(__dirname, '..', 'assets', 'airdrop.csv');

const TEN_K_LONDON = utils.parseEther('10000');

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const londonGift = ERC721__factory.connect(
  '0x7645eec8bb51862a5aa855c40971b2877dae81af',
  provider,
);

(async () => {
  // get $LONDON holders
  const londonBalance: { [address: string]: BigNumber } = {};

  const pageSize = 100;
  let currentPageIndex = 0;
  let isCurrentPageFull = true;
  while (isCurrentPageFull) {
    const res = await graphQlFetcher(
      'https://api.thegraph.com/subgraphs/name/proofofbeauty/london',
      `
        query {
          tokenOwnerships(first: ${pageSize}, skip:${
        currentPageIndex * pageSize
      }, orderBy: quantity, orderDirection: desc) {
            owner
            quantity
          }
        }
      `,
    );
    res.tokenOwnerships.forEach((t: any) => {
      londonBalance[t.owner.toLowerCase()] = BigNumber.from(t.quantity);
    });

    isCurrentPageFull = res.tokenOwnerships.length >= pageSize;
    currentPageIndex++;
  }

  // get LONDON GIFT holders
  const giftBalance: { [address: string]: number } = {};

  for (let i = 0; i < 8888; ++i) {
    const tokenIndex = (i < 3655 ? i + 8888 : i) - 3655;
    try {
      console.log(i, tokenIndex);
      const owner = await londonGift.ownerOf(tokenIndex);
      console.log(owner);
      if (!giftBalance[owner.toLowerCase()]) {
        giftBalance[owner.toLowerCase()] = 1;
      } else {
        giftBalance[owner.toLowerCase()]++;
      }
    } catch (e) {
      console.log(e);
    }
  }

  const airdropBalance: { [address: string]: BigNumber } = Object.assign(
    {},
    londonBalance,
  );
  Object.entries(giftBalance).forEach(([address, bal]) => {
    const value = TEN_K_LONDON.mul(bal);
    if (!airdropBalance[address]) {
      airdropBalance[address] = value;
    } else {
      airdropBalance[address] = airdropBalance[address].add(value);
    }
  });

  // csv
  const csv =
    'ADDRESS, LONDON_BALANCE, GIFT_BALANCE, AIRDROP_BALANCE, EMBERS_AIRDROPPED \n' +
    Object.entries(airdropBalance)
      .filter(([o, b]) => {
        return b.gte(TEN_K_LONDON.mul(5));
      })
      .filter(
        ([o]) =>
          ![
            '0x000000000000000000000000000000000000dead',
            '0x5766ab511a204c34661e85af5ba498e2e715a420',
            '0xd5a7d56ea8a36f855be3720cec1c9b8e4d30c732',
            '0x84a451ba6eeabbafcf24325297ca95ffa9396e4b',
          ].includes(o),
      )
      .map(([o, v]) => {
        let a = 0;
        if (v.gte(TEN_K_LONDON.mul(5))) {
          a = 2;
        }
        if (v.gte(TEN_K_LONDON.mul(10))) {
          a = 5;
        }
        if (v.gte(TEN_K_LONDON.mul(30))) {
          a = 16;
        }
        return `${o}, ${utils.formatEther(
          londonBalance[o] ?? BigNumber.from(0),
        )}, ${giftBalance[o] ?? BigNumber.from(0)}, ${utils.formatEther(
          v,
        )}, ${a} \n`;
      })
      .join('');

  await writeFileAsync(CSV_PATH, csv);
})();
