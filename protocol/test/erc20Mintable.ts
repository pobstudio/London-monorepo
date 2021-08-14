import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { Erc20Mintable } from '../typechain/ERC20Mintable';
import { expect } from 'chai';

const TOKEN_SYMBOL = '$MINT';
const TOKEN_NAME = '$MINT';

describe('Erc20Token', function () {
  // constant values used in transfer tests
  let erc20Mintable: Erc20Mintable;
  let owner: Signer;
  let minter: Signer;
  let rando: Signer;
  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    minter = accounts[1];
    rando = accounts[2];
  });

  beforeEach(async function () {
    const Erc20Mintable = await ethers.getContractFactory('ERC20Mintable');
    erc20Mintable = (await Erc20Mintable.deploy(
      await minter.getAddress(),
      TOKEN_NAME,
      TOKEN_SYMBOL,
    )) as Erc20Mintable;
    await erc20Mintable.deployed();
  });

  describe('setMinter', () => {
    it('should set new minter address', async function () {
      await erc20Mintable.connect(owner).setMinter(await rando.getAddress());
      expect(await erc20Mintable.minter()).to.eq(await rando.getAddress());
    });
    it('should not set new minter address by rando', async function () {
      await expect(
        erc20Mintable.connect(rando).setMinter(erc20Mintable.address),
      ).to.reverted;
    });
  });

  describe('mint', () => {
    it('should not mint if not minter', async function () {
      await expect(
        erc20Mintable
          .connect(rando)
          .mint(await rando.getAddress(), BigNumber.from(1000)),
      ).to.revertedWith('Only minter can call.');
    });

    it('should mint if minter', async function () {
      await erc20Mintable
        .connect(minter)
        .mint(await rando.getAddress(), BigNumber.from(1000));
      expect(await erc20Mintable.balanceOf(await rando.getAddress())).to.eq(
        BigNumber.from(1000),
      );
    });
  });
});
