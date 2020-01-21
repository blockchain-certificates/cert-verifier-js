import { SUB_STEPS, TRANSACTION_APIS, TRANSACTION_ID_PLACEHOLDER } from '../constants';
import { buildTransactionApiUrl } from '../services/transaction-apis';
import { request } from '../services/request';
import { VerifierError } from '../models';
import { getText } from '../domain/i18n/useCases';
import { generateTransactionDataFromBitpayResponse } from './bitcoin/bitpay';
import { generateTransactionDataFromBlockcypherResponse } from './bitcoin/blockcypher';
import { generateTransactionDataFromBlockexplorerResponse } from './bitcoin/blockexplorer';
import { generateTransactionDataFromBlockstreamResponse } from './bitcoin/blockstream';
import { generateTransactionDataFromEtherscanResponse } from './ethereum/etherscan';
import { isTestChain } from '../constants/blockchains';

function isTransactionGeneratorAsync (chain) {
  return chain === TRANSACTION_APIS.Etherscan;
}

export async function getBlockchainTransactionFromApi (apiName, transactionId, chain) {
  const requestUrl = buildTransactionApiUrl({
    apiName,
    searchValue: TRANSACTION_ID_PLACEHOLDER,
    newValue: transactionId,
    testApi: isTestChain(chain)
  });

  return new Promise((resolve, reject) => {
    return request({ url: requestUrl }).then(response => {
      try {
        const txMethod = getTransactionDataGeneratorPerApi(apiName);
        if (isTransactionGeneratorAsync(chain)) {
          txMethod(JSON.parse(response), chain).then((transactionData) => {
            resolve(transactionData);
          }).catch(err => {
            reject(err.message);
          });
        } else {
          resolve(txMethod(JSON.parse(response), chain));
        }
      } catch (err) {
        reject(err.message);
      }
    }).catch(() => {
      reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
    });
  });
}

const API_TRANSACTION_DATA_GENERATORS = {
  [TRANSACTION_APIS.Bitpay]: generateTransactionDataFromBitpayResponse,
  [TRANSACTION_APIS.Blockcypher]: generateTransactionDataFromBlockcypherResponse,
  [TRANSACTION_APIS.Blockexplorer]: generateTransactionDataFromBlockexplorerResponse,
  [TRANSACTION_APIS.Blockstream]: generateTransactionDataFromBlockstreamResponse,
  [TRANSACTION_APIS.Etherscan]: generateTransactionDataFromEtherscanResponse
};

function getTransactionDataGeneratorPerApi (apiName) {
  const transactionDataGenerator = API_TRANSACTION_DATA_GENERATORS[apiName];
  if (!transactionDataGenerator) {
    throw new Error(`API ${apiName} is not listed`);
  }
  return transactionDataGenerator;
}
