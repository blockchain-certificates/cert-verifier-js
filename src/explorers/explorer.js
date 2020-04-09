import { SUB_STEPS, TRANSACTION_APIS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionApiUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { parseTransactionDataFromBitpayResponse } from './bitcoin/bitpay';
import { parseTransactionDataFromBlockcypherResponse } from './bitcoin/blockcypher';
import { parseTransactionDataFromBlockexplorerResponse } from './bitcoin/blockexplorer';
import { parseTransactionDataFromBlockstreamResponse } from './bitcoin/blockstream';
import { isTestChain } from '../constants/blockchains';

export async function getBitcoinTransactionFromApi (apiName, transactionId, chain) {
  const requestUrl = buildTransactionApiUrl({
    apiName,
    searchValue: TRANSACTION_ID_PLACEHOLDER,
    newValue: transactionId,
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

const API_TRANSACTION_PARSING_FUNCTIONS = {
  [TRANSACTION_APIS.Bitpay]: parseTransactionDataFromBitpayResponse,
  [TRANSACTION_APIS.Blockcypher]: parseTransactionDataFromBlockcypherResponse,
  [TRANSACTION_APIS.Blockexplorer]: parseTransactionDataFromBlockexplorerResponse,
  [TRANSACTION_APIS.Blockstream]: parseTransactionDataFromBlockstreamResponse
};

function getApiParsingFunction (apiName) {
  const transactionDataGenerator = API_TRANSACTION_PARSING_FUNCTIONS[apiName];
  if (!transactionDataGenerator) {
    throw new Error(`API ${apiName} is not listed`);
  }
  return transactionDataGenerator;
}
