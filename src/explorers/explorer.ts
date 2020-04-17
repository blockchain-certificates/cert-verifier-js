import { SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { PublicAPIs } from './public-apis';
import { isTestChain } from '../constants/blockchains';
import { TRANSACTION_APIS } from '../constants/api';

export async function getTransactionFromApi (apiName: TRANSACTION_APIS, transactionId: string, chain) {
  const requestUrl = buildTransactionServiceUrl({
    serviceUrls: PublicAPIs[apiName].serviceUrls,
    transactionIdPlaceholder: TRANSACTION_ID_PLACEHOLDER,
    transactionId: transactionId,
    isTestApi: isTestChain(chain)
  });

  try {
    const response = await request({ url: requestUrl });
    return await getApiParsingFunction(apiName)(JSON.parse(response), chain);
  } catch (err) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
  }
}

function getApiParsingFunction (apiName) {
  const publicAPI = PublicAPIs[apiName];
  if (!publicAPI) {
    throw new Error(`API ${apiName} is not listed`);
  }
  return publicAPI.parsingTransactionDataFunction;
}
