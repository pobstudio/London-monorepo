# LONDON Monorepo

The official monorepo powering the LONDON contracts, generative art, and front-end dapp.

## Useful links

[production link](https://london.pob.studio)

[snapshot governance link](https://snapshot.org/#/london.pob.eth)

## Packages

The LONDON repo is structured as a monorepo containing many packages that reach all aspects of the LONDON ecosystem.

| Package                 | Description                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| [`app`](/app)           | Core next.js webapp of pob.studio and HASH and lambdas                                          |
| [`protocol`](/protocol) | Core protocol of LONDON, contains the ERC721 token, minter contracts, and other future things. |
| [`sketches`](/sketches) | Generative art and a development runtime                                                        |
| [`scripts`](/scripts)   | Some administrative scripts to help with running POB (ie refresh opensea metadata)              |

## Setting up the monorepo

The `sketches` package depends on the `node-canvas` package which have external binary dependencies. Before running `yarn install` first consult the docs [here](https://github.com/Automattic/node-canvas).

In the root of the directory:

```
$ yarn install
```

### Running app

Visit the `app` repo and add a `.env` file with the following variables:

```
NEXT_PUBLIC_CHAIN_ID="1"
NEXT_PUBLIC_ALCHEMY_KEY="ALCHEMY_KEY"
```

Setup an [alchemy](http://alchemy.com/) account and get an api key to be put in the .env file.

Walla! visit `localhost:3000` to see your build running locally!

### Running protocol

Visit the `protocol` repo and add a `.env` file with the following variables:

```
RINKEBY_NETWORK_RPC_URL="OPTIONAL"
RINKEBY_MNEMONIC="OPTIONAL"
MAINNET_NETWORK_RPC_URL="OPTIONAL"
MAINNET_PRIVATE_KEY="OPTIONAL"
ETHERSCAN_API_KEY="OPTIONAL"
```

Provide either networks corresponding url and key.

With `npx` you can run hardhat tasks like so:

```
$ npx hardhat deploy-nft --network rinkeby
```

## Contributing

As the project is now governed by the LONDON DAO, this repo's continued development is incentived via DAO proposals and grants. As POB studios, we will maintain and host the production build of the website and review PRs.

## LICENSE

[MIT](/LICENSE)
