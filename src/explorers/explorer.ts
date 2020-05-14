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
import { explorerApi as BlockExplorerApi } from './bitcoin/blockexplorer';
import { explorerApi as BlockstreamApi } from './bitcoin/blockstream';
import { explorerApi as BlockCypherBTCApi } from './bitcoin/blockcypher';
import { explorerApi as BitPayApi } from './bitcoin/bitpay';

export type TExplorerFunctionsArray = Array<{
  parsingFunction: (transactionId: string, chain: SupportedChains) => Promise<TransactionData>;
  priority?: number;
}>;
export type TExplorerParsingFunction = ((jsonResponse, chain?: SupportedChains) => TransactionData) |
((jsonResponse, chain?: SupportedChains) => Promise<TransactionData>);

export function explorerFactory (TransactionAPIArray: ExplorerAPI[]): TExplorerFunctionsArray {
  return TransactionAPIArray
    .map(explorerAPI => (
      {
        parsingFunction: async (transactionId, chain) => await getTransactionFromApi(explorerAPI, transactionId, chain),
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
    serviceUrls: explorerAPI.serviceURL,
    transactionId,
    isTestApi: isTestChain(chain)
  });

  try {
    const response = await request({ url: requestUrl });
    return await explorerAPI.parsingFunction(JSON.parse(response), chain);
  } catch (err) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
  }
}

const BitcoinTransactionAPIArray = [
  BlockCypherBTCApi,
  BitPayApi,
  BlockExplorerApi,
  BlockstreamApi
];

const EthereumTransactionAPIArray = [
  EtherscanApi,
  BlockCypherETHApi
];

export const BitcoinExplorers: TExplorerFunctionsArray = explorerFactory(BitcoinTransactionAPIArray);
export const EthereumExplorers: TExplorerFunctionsArray = explorerFactory(EthereumTransactionAPIArray);

// for legacy (pre-v2) Blockcerts
export const BlockchainExplorersWithSpentOutputInfo: TExplorerFunctionsArray = explorerFactory([BlockCypherBTCApi]);
