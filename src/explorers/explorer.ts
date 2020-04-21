import { SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { isTestChain, SupportedChains } from '../constants/blockchains';
import { TransactionData } from '../models/TransactionData';
import { ExplorerAPI } from '../certificate';

export type TExplorerParsingFunction = {(jsonResponse, chain?: SupportedChains): TransactionData} |
  {(jsonResponse, chain?: SupportedChains): Promise<TransactionData>};

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
