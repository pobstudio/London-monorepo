export interface Deployment {
  multisig: string;
  erc20: string;
  minter: string;
  gift: string;
  contractURI: string;
  baseTokenURI: string;
  embers: string;
  embersMinter: string;
  embersContractURI: string;
  embersMintingAuthority: string;
  sushiswap: string;
}

export type Deployments = { [chainId: number]: Deployment };
