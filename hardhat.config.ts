import 'dotenv/config';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-gas-reporter';
import '@typechain/hardhat';
import 'hardhat-deploy-tenderly';

const { ALCHEMY_KEY, MNEMONIC, PK } = process.env;
const DEFAULT_MNEMONIC = "hello darkness my old friend";

const sharedNetworkConfig : any = {};
if (PK) {
  sharedNetworkConfig.accounts = [PK];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
  };
}

module.exports = {
  paths: {
    artifacts: "artifacts",
    cache: "cache",
    deploy: "deploy",
    sources: "contracts",
    imports: "imports"
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      ...sharedNetworkConfig,
      url: "http://127.0.0.1:8545",
      blockGasLimit: 100000000,
      gas: 2000000,
      saveDeployments: true,
    },
    hardhat: {
      blockGasLimit: 10000000000000,
      gas: 200000000000,
      saveDeployments: true,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      saveDeployments: true,
    },
    ganache: {
      ...sharedNetworkConfig,
      url: "http://127.0.0.1:7545",
      saveDeployments: false,
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    root: 0,
    beneficiary: 1,
  },
};