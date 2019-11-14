import { request } from '../services';
import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_APIS } from '../constants';
import { TransactionData, VerifierError } from '../models';
import { stripHashPrefix } from './utils/stripHashPrefix';
import { getText } from '../domain/i18n/useCases';
import { TRANSACTIONS_APIS_URLS } from '../constants/api';

export function getEtherScanFetcher (transactionId, chain) {
  const action = '&action=eth_getTransactionByHash&txhash=';
  let etherScanUrl;
  if (chain === BLOCKCHAINS.ethmain.code) {
    etherScanUrl = TRANSACTIONS_APIS_URLS[TRANSACTION_APIS.Etherscan].main + action + transactionId;
  } else {
    etherScanUrl = TRANSACTIONS_APIS_URLS[TRANSACTION_APIS.Etherscan].ropsten + action + transactionId;
  }

  let etherScanFetcher = new Promise((resolve, reject) => {
    return request({ url: etherScanUrl })
      .then(function (response) {
        const responseTxData = JSON.parse(response);
        try {
          // Parse block to get timestamp first, then create TransactionData
          let blockFetcher = getEtherScanBlock(responseTxData, chain);
          blockFetcher
            .then(function (blockResponse) {
              const txData = parseEtherScanResponse(responseTxData, blockResponse);
              resolve(txData);
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
  return etherScanFetcher;
}

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
  const action = '&action=eth_getBlockByNumber&boolean=true&tag=';
  let etherScanUrl;
  if (chain === BLOCKCHAINS.ethmain.code) {
    etherScanUrl = TRANSACTIONS_APIS_URLS[TRANSACTION_APIS.Etherscan].main + action + blockNumber;
  } else {
    etherScanUrl = TRANSACTIONS_APIS_URLS[TRANSACTION_APIS.Etherscan].ropsten + action + blockNumber;
  }

  return new Promise((resolve, reject) => {
    return request({ url: etherScanUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        const blockData = responseData.result;
        try {
          let checkConfirmationsFetcher = checkEtherScanConfirmations(chain, blockNumber);
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
  const action = '&action=eth_blockNumber';
  let etherScanUrl;
  if (chain === BLOCKCHAINS.ethmain.code) {
    etherScanUrl = TRANSACTIONS_APIS_URLS[TRANSACTION_APIS.Etherscan].main + action;
  } else {
    etherScanUrl = TRANSACTIONS_APIS_URLS[TRANSACTION_APIS.Etherscan].ropsten + action;
  }

  return new Promise((resolve, reject) => {
    return request({ url: etherScanUrl })
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
