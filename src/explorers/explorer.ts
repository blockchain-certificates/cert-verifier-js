import { SUB_STEPS } from '../constants';
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { isTestChain, SupportedChains } from '../constants/blockchains';
import { TransactionData } from '../models/TransactionData';
import { ExplorerAPI } from '../certificate';
import { explorerApi as EtherscanApi } from './ethereum/etherscan';
import { explorerApi as BlockCypherETHApi } from './ethereum/blockcypher';
import { explorerApi as BlockstreamApi } from './bitcoin/blockstream';
import { explorerApi as BlockCypherBTCApi } from './bitcoin/blockcypher';

export type TExplorerFunctionsArray = Array<{
  getTxData: (transactionId: string, chain: SupportedChains) => Promise<TransactionData>;
  priority?: number;
}>;
export type TExplorerParsingFunction = ((jsonResponse, chain?: SupportedChains, key?: string, keyPropertyName?: string) => TransactionData) |
((jsonResponse, chain?: SupportedChains, key?: string, keyPropertyName?: string) => Promise<TransactionData>);

export function explorerFactory (TransactionAPIArray: ExplorerAPI[]): TExplorerFunctionsArray {
  return TransactionAPIArray
    .map(explorerAPI => (
      {
        getTxData: async (transactionId, chain) => await getTransactionFromApi(explorerAPI, transactionId, chain),
        priority: explorerAPI.priority
      }
    ));
}

export async function getTransactionFromApi (
  explorerAPI: ExplorerAPI,
  transactionId: string,
  chain: SupportedChains
): Promise<TransactionData> {
  const requestUrl = buildTransactionServiceUrl({
    explorerAPI,
    transactionId,
    isTestApi: isTestChain(chain)
  });

  try {
    const response = await request({ url: requestUrl });
    return await explorerAPI.parsingFunction(JSON.parse(response), chain, explorerAPI.key, explorerAPI.keyPropertyName);
  } catch (err) {
    console.error(err);
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
  }
}

const BitcoinTransactionAPIArray = [
  BlockCypherBTCApi,
  BlockstreamApi
];

const EthereumTransactionAPIArray = [
  EtherscanApi,
  BlockCypherETHApi
];

const BlockchainExplorersWithSpentOutputInfo = [
  BlockCypherBTCApi
];

export {
  BitcoinTransactionAPIArray,
  EthereumTransactionAPIArray,
  BlockchainExplorersWithSpentOutputInfo
};
