export interface Deployment {
  multisig: string; 
  erc1155: string;
}

export type Deployments = { [chainId: number]: Deployment };
