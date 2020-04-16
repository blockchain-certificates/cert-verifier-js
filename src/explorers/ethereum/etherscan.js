import { request } from '../../services';
import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';
import { buildTransactionServiceUrl } from '../../services/transaction-apis';
import { isTestChain } from '../../constants/blockchains';

const ETHERSCAN_API_KEY = 'FJ3CZWH8PQBV8W5U6JR8TMKAYDHBKQ3B1D';
const MAIN_API_BASE_URL = `https://api.etherscan.io/api?module=proxy&apikey=${ETHERSCAN_API_KEY}`;
const TEST_API_BASE_URL = `https://api-ropsten.etherscan.io/api?module=proxy&apikey=${ETHERSCAN_API_KEY}`;
const serviceUrls = {
  main: `${MAIN_API_BASE_URL}&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`,
  test: `${TEST_API_BASE_URL}&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`
};
const getBlockByNumberServiceUrls = {
  main: `${MAIN_API_BASE_URL}&action=eth_getBlockByNumber&boolean=true&tag=${TRANSACTION_ID_PLACEHOLDER}`,
  test: `${TEST_API_BASE_URL}&action=eth_getBlockByNumber&boolean=true&tag=${TRANSACTION_ID_PLACEHOLDER}`
};
const getBlockNumberServiceUrls = {
  main: `${MAIN_API_BASE_URL}&action=eth_blockNumber`,
  test: `${TEST_API_BASE_URL}&action=eth_blockNumber`
};

function parseEtherScanResponse (jsonResponse, block) {
  const data = jsonResponse.result;
  const date = new Date(parseInt(block.timestamp, 16) * 1000);
  const issuingAddress = data.from;
  const opReturnScript = stripHashPrefix(data.input, BLOCKCHAINS.ethmain.prefixes); // remove '0x'

  // The method of checking revocations by output spent do not work with Ethereum.
  // There are no input/outputs, only balances.
  return new TransactionData(opReturnScript, issuingAddress, date, undefined);
}

function getEtherScanBlock (jsonResponse, chain) {
  const data = jsonResponse.result;
  const blockNumber = data.blockNumber;
  const requestUrl = buildTransactionServiceUrl({
    serviceUrls: getBlockByNumberServiceUrls,
    searchValue: TRANSACTION_ID_PLACEHOLDER,
    newValue: blockNumber,
    testApi: isTestChain(chain)
  });

  return new Promise((resolve, reject) => {
    return request({ url: requestUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        const blockData = responseData.result;
        try {
          const checkConfirmationsFetcher = checkEtherScanConfirmations(chain, blockNumber);
          checkConfirmationsFetcher
            .then(function () {
              resolve(blockData);
            })
            .catch(function () {
              reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
            });
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
        }
      }).catch(function () {
        reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
      });
  });
}

function checkEtherScanConfirmations (chain, blockNumber) {
  const requestUrl = buildTransactionServiceUrl({
    serviceUrls: getBlockNumberServiceUrls,
    testApi: isTestChain(chain)
  });

  return new Promise((resolve, reject) => {
    return request({ url: requestUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        const currentBlockCount = responseData.result;
        try {
          if (currentBlockCount - blockNumber < CONFIG.MininumConfirmations) {
            reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'checkEtherScanConfirmations')));
          }
          resolve(currentBlockCount);
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
        }
      }).catch(function () {
        reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash')));
      });
  });
}

function parsingTransactionDataFunction (jsonResponse, chain) {
  // Parse block to get timestamp first, then create TransactionData
  const blockFetcher = getEtherScanBlock(jsonResponse, chain);
  blockFetcher.then(function (blockResponse) {
    return parseEtherScanResponse(jsonResponse, blockResponse);
  }).catch(function () {
    throw new Error(getText('errors', 'unableToGetRemoteHash'));
  });
}

export {
  serviceUrls,
  parsingTransactionDataFunction
};
