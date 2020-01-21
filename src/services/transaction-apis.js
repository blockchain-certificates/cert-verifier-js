import { TRANSACTIONS_APIS_URLS } from '../constants/api';

export function buildTransactionApiUrl ({ apiName, searchValue = '', newValue = '', testApi = false }) {
  const api = TRANSACTIONS_APIS_URLS[apiName];
  if (!api) {
    throw new Error(`API ${apiName} is not listed`);
  }
  const apiUrl = testApi ? api.test : api.main;
  return apiUrl.replace(searchValue, newValue);
}
