# Simple Staking DeFi App
This repo contains the smart contracts to create a Staking contracts factory.

## Development

requires

```
node >= 12.0
```

to install node modules

```
npm i
```

to compile run

```
npm run compile
```

to test

```
npm run test
```

to run coverage

```
npm run coverage
```

## Environment setup

please prepare `.env` file

```bash
touch .env
```

and add the following

```
ALCHEMY_KEY = infura key
MNEMONIC = mnemonic (choose our development mnemonic to be able to interact with the deployed contracts with the deployer address)
PK = private-key
```

Note:`.env` should be created in root directory.

## Deployment

This project uses the hardhat-deploy plugin to deploy contracts. When a contract has been deployed, it is saved as JSON to the `deployments` directory, including its _address_ as well as its _abi_. It uses deployment tags that are used to deploy the contracts in the desired order.

### Deployment to goerli

General (one tag):
`npm run deploy:contracts:goerli --tags=<YOUR_TAG_NAME>`

General (multiple tags):
`npm run deploy:contracts:goerli --tags=<YOUR_TAG_NAME1>,<YOUR_TAG_NAME2>`


### Deployment to mainnet

General (one tag):
`npm run deploy:contracts:mainnet --tags=<YOUR_TAG_NAME>`

General (multiple tags):
`npm run deploy:contracts:mainnet --tags=<YOUR_TAG_NAME1>,<YOUR_TAG_NAME2>`

<!-- ## Run frontend

After having installed all the modules, run the following command to run a basic frontend to interact with the DAO.

```
npm run serve
```
Port will be configured in the `.env` file by the name of "NEXT_PUBLIC_PORT". -->

## Code formatting

To format JS and Solidity code, run the following command:

`npm run format`