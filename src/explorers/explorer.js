import { SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionServiceUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { BitcoinAPIs } from './bitcoin';
import { isTestChain } from '../constants/blockchains';

export async function getBitcoinTransactionFromApi (apiName, transactionId, chain) {
  const requestUrl = buildTransactionServiceUrl({
    serviceUrls: BitcoinAPIs[apiName].serviceUrls,
    transactionIdPlaceholder: TRANSACTION_ID_PLACEHOLDER,
    transactionId: transactionId,
    testApi: isTestChain(chain)
  });

  return new Promise((resolve, reject) => {
    return request({ url: requestUrl }).then(response => {
      try {
        const transactionData = getApiParsingFunction(apiName)(JSON.parse(response));
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
  const transactionDataGenerator = BitcoinAPIs[apiName];
  if (!transactionDataGenerator) {
    throw new Error(`API ${apiName} is not listed`);
  }
  return transactionDataGenerator.parsingTransactionDataFunction;
}
