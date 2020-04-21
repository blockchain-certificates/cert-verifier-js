import { SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { PublicAPIs } from './public-apis';
import { isTestChain, SupportedChains } from '../constants/blockchains';
import { TRANSACTION_APIS } from '../constants/api';
import { TransactionData } from '../models/TransactionData';

export type TExplorerParsingFunction = {(jsonResponse, chain?: SupportedChains): TransactionData} | {(jsonResponse, chain?: SupportedChains): Promise<TransactionData>};

export async function getTransactionFromApi (apiName: TRANSACTION_APIS, transactionId: string, chain: SupportedChains): Promise<TransactionData> {
  const publicAPI = PublicAPIs[apiName];
  if (!publicAPI) {
    throw new Error(`API ${apiName} is not listed`);
  }
  const requestUrl = buildTransactionServiceUrl({
    serviceUrls: publicAPI.serviceURL,
    transactionId,
    isTestApi: isTestChain(chain)
  });

  try {
    const response = await request({ url: requestUrl });
    return await publicAPI.parsingFunction(JSON.parse(response), chain);
  } catch (err) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
  }
}
