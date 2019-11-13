import { TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { TRANSACTIONS_APIS_URLS } from '../constants/api';

export function buildTransactionApiUrl (apiName, transactionId, testApi = false) {
  const api = TRANSACTIONS_APIS_URLS[apiName];
  if (!api) {
    throw new Error(`API ${apiName} is not listed`);
  }
  const apiUrl = testApi ? (api.testnet ? api.testnet : api.mainnet) : api.mainnet;
  return apiUrl.replace(TRANSACTION_ID_PLACEHOLDER, transactionId);
}
