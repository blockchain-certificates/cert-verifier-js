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

function cleanupExplorerAPIs (explorerAPIs: ExplorerAPI[], indexes: number[]): void {
  indexes.forEach(index => explorerAPIs.splice(index, 1)); // remove modified explorer to avoid setting them in the custom option later
}

function validateOverwritingExplorer (explorerAPI: ExplorerAPI): boolean {
  if (explorerAPI.key && !explorerAPI.keyPropertyName) {
    throw new Error(`Property keyPropertyName is not set for ${explorerAPI.serviceName}. Cannot pass the key property to the service.`);
  }
  return true;
}

const overwrittenIndexes: number[] = [];

export function overwriteDefaultExplorers (explorerAPIs: ExplorerAPI[] = [], defaultExplorers: ExplorerAPI[] = [], lastSetOfExplorers = false): ExplorerAPI[] {
  const userSetExplorerAPIsName = explorerAPIs
    .map(explorerAPI => explorerAPI.serviceName)
    .filter(name => !!name)
    .filter(name => !!TRANSACTION_APIS[name]);

  if (userSetExplorerAPIsName.length) {
    return defaultExplorers.reduce((overwrittenExplorers, defaultExplorerAPI) => {
      if (userSetExplorerAPIsName.includes(defaultExplorerAPI.serviceName)) {
        const immutableExplorerAPI = Object.assign({}, defaultExplorerAPI);
        const customSetExplorerAPI = explorerAPIs.find(customExplorerAPI => customExplorerAPI.serviceName === defaultExplorerAPI.serviceName);
        if (validateOverwritingExplorer(customSetExplorerAPI)) {
          const overwrittenExplorerAPI = Object.assign(immutableExplorerAPI, customSetExplorerAPI);
          overwrittenExplorers.push(overwrittenExplorerAPI);
          const explorerAPIsIndex = explorerAPIs.findIndex(explorerAPI => explorerAPI.serviceName === overwrittenExplorerAPI.serviceName);
          if (!overwrittenIndexes.includes(explorerAPIsIndex)) {
            overwrittenIndexes.push(explorerAPIsIndex);
          }
        }
      } else {
        overwrittenExplorers.push(defaultExplorerAPI);
      }
      if (lastSetOfExplorers) {
        cleanupExplorerAPIs(explorerAPIs, overwrittenIndexes);
      }
      return overwrittenExplorers;
    }, []);
  }

  return defaultExplorers;
}

export function getDefaultExplorers (explorerAPIs?: ExplorerAPI[]): TDefaultExplorersPerBlockchain {
  return {
    bitcoin: explorerFactory(overwriteDefaultExplorers(explorerAPIs, BitcoinExplorers)),
    ethereum: explorerFactory(overwriteDefaultExplorers(explorerAPIs, EthereumExplorers)),
    v1: explorerFactory(overwriteDefaultExplorers(explorerAPIs, BlockchainExplorersWithSpentOutputInfo, true))
  };
}
