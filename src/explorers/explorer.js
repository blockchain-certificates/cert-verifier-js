import { SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { PublicAPIs } from './public-apis';
import { isTestChain } from '../constants/blockchains';

export async function getBitcoinTransactionFromApi (apiName, transactionId, chain) {
  const requestUrl = buildTransactionServiceUrl({
    serviceUrls: PublicAPIs[apiName].serviceUrls,
    transactionIdPlaceholder: TRANSACTION_ID_PLACEHOLDER,
    transactionId: transactionId,
    testApi: isTestChain(chain)
  });

  return new Promise((resolve, reject) => {
    return request({ url: requestUrl }).then(response => {
      try {
        const transactionData = getApiParsingFunction(apiName)(JSON.parse(response), chain);
        resolve(transactionData);
      } catch (err) {
        reject(err.message);
      }
    }).catch(() => {
      reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
    });
  });
}

function getApiParsingFunction (apiName) {
  const publicAPI = PublicAPIs[apiName];
  if (!publicAPI) {
    throw new Error(`API ${apiName} is not listed`);
  }
  return publicAPI.parsingTransactionDataFunction;
}
