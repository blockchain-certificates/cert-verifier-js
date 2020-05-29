import {
  BitcoinTransactionAPIArray as BitcoinExplorers,
  BlockchainExplorersWithSpentOutputInfo,
  EthereumTransactionAPIArray as EthereumExplorers,
  explorerFactory,
  TExplorerFunctionsArray
} from './explorer';
import { ExplorerAPI } from '../certificate';
import { TRANSACTION_APIS } from '../constants/api';

export interface TDefaultExplorersPerBlockchain {
  bitcoin: TExplorerFunctionsArray;
  ethereum: TExplorerFunctionsArray;
  v1: TExplorerFunctionsArray;
}

export function overwriteDefaultExplorers (explorerAPIs: ExplorerAPI[], defaultExplorers: ExplorerAPI[]): ExplorerAPI[] {
  const userSetExplorerAPIsName = explorerAPIs
    .map(explorerAPI => explorerAPI.serviceName)
    .filter(name => !!name)
    .filter(name => !!TRANSACTION_APIS[name]);

  if (userSetExplorerAPIsName.length) {
    return defaultExplorers.reduce((overwrittenExplorers, defaultExplorerAPI) => {
      if (userSetExplorerAPIsName.includes(defaultExplorerAPI.serviceName)) {
        const immutableExplorerAPI = Object.assign({}, defaultExplorerAPI);
        const customSetExplorerAPI = explorerAPIs.find(customExplorerAPI => customExplorerAPI.serviceName === defaultExplorerAPI.serviceName);
        const overwrittenExplorerAPI = Object.assign(immutableExplorerAPI, customSetExplorerAPI);
        overwrittenExplorers.push(overwrittenExplorerAPI);
      } else {
        overwrittenExplorers.push(defaultExplorerAPI);
      }
      return overwrittenExplorers;
    }, []);
  }

  return defaultExplorers;
}

export function getDefaultExplorers (explorerAPIs: ExplorerAPI[]): TDefaultExplorersPerBlockchain {
  return {
    bitcoin: explorerFactory(BitcoinExplorers),
    ethereum: explorerFactory(EthereumExplorers),
    v1: explorerFactory(BlockchainExplorersWithSpentOutputInfo)
  };
}
