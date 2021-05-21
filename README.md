# POB Monorepo boilerplate

---

[UNDER CONSTRUCTION] POB monorepo boilerplate to get projects off the ground FAST. Contains project front ends, lambdas, admin scripts, and protocol.

## Useful links

[vercel dashboard](https://vercel.com/pob)

If you can not access the dashboard, ping David (@dave4506)

## Packages

The POB repo is structured as a monorepo containing many packages that reach all aspects of the POB ecosystem.

| Package                 | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| [`app`](/app)           | Core next.js webapp of pob.studio and HASH and lambdas                                       |
| [`protocol`](/protocol) | Core protocol of POB, contains the ERC1155 token, minter contracts, and other future things. |
| [`sketches`](/sketches) | Shared generative algorithm utils                                                            |
| [`scripts`](/scripts)   | Some administrative scripts to help with running POB (ie refresh opensea metadata)           |

## Running the monorepo

In the root of the directory:

```
$ yarn install
```

### Running app

You will need the `vercel` CLI

```
$ npm i -g vercel
```

Then login to vercel

```
vercel login
```

Then run `vercel` and link to `app`

Run

```
$ vercel dev
```

All the local dev envs will be automagically pulled.

Walla! visit `localhost:3000` to see your build running locally!

## Contributing + Usage

Node version 10.x is required.

In the root of the directory:

```
$ yarn install
```

`sketches`

```
NETWORK_RPC_URL="OPTIONAL"
PRIVATE_KEY="OPTIONAL"
```

The private key and rpc is used if you want to deploy the algorithmn to the Ethereum blockchain.

`protocol`

```
RINKEBY_NETWORK_RPC_URL="OPTIONAL"
RINKEBY_MNEMONIC="OPTIONAL"
MAINNET_NETWORK_RPC_URL="OPTIONAL"
MAINNET_PRIVATE_KEY="OPTIONAL"
ETHERSCAN_API_KEY="OPTIONAL"
```

Provide either networks corresponding url and key.
