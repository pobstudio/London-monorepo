export interface Deployment {
  multisig: string;
  erc20: string;
  minter: string;
  gift: string;
  contractURI: string;
  baseTokenURI: string;
}

export type Deployments = { [chainId: number]: Deployment };
