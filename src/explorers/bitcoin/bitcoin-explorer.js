import { BLOCKCHAINS, SUB_STEPS, TRANSACTION_APIS } from '../../constants';
import { buildTransactionApiUrl } from '../../services/transaction-apis';
import { request } from '../../services/request';
import { VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { parseTransactionDataFromBitpayResponse } from './apis/bitpay';
import { parseTransactionDataFromBlockcypherResponse } from './apis/blockcypher';
import { parseTransactionDataFromBlockexplorerResponse } from './apis/blockexplorer';
import { parseTransactionDataFromBlockstreamResponse } from './apis/blockstream';

export async function getBitcoinTransactionFromApi (apiName, transactionId, chain) {
  const isTestnet = chain !== BLOCKCHAINS.bitcoin.code;
  const requestUrl = buildTransactionApiUrl(apiName, transactionId, isTestnet);

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
