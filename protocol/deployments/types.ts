export interface Deployment {
  multisig: string;
  erc20: string;
  minter: string;
}

export type Deployments = { [chainId: number]: Deployment };
