export interface AirdropCheck {
  nobility: number;
  to: string;
  signature: string;
}

export interface AirdropCheckWithAirdropState extends AirdropCheck {
  numAirdropped?: number;
}

export interface MintCheck {
  uris: string[];
  to: string;
  tokenType: string;
  signature: string;
}
