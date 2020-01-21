import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_APIS } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { BLOCK_NUMBER_PLACEHOLDER } from '../../constants/api';
import { request } from '../../services';
import { buildTransactionApiUrl } from '../../services/transaction-apis';

export function generateTransactionDataFromEtherscanResponse (jsonResponse, isTestChain) {
  try {
    // Parse block to get timestamp first, then create TransactionData
    return getEtherScanBlock(jsonResponse, isTestChain)
      .then(function (blockResponse) {
        return parseEtherScanResponse(jsonResponse, blockResponse);
      })
      .catch(function () {
        throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
      });
  } catch (err) {
    // don't need to wrap this exception
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
  }
}

function checkEtherScanConfirmations (blockNumber, isTestChain) {
  const etherScanUrl = buildTransactionApiUrl({
    apiName: TRANSACTION_APIS.EtherscanBlockNumber,
    testApi: isTestChain
  });

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

export function getEtherScanBlock (jsonResponse, isTestChain) {
  const data = jsonResponse.result;
  const blockNumber = data.blockNumber;

  const etherScanUrl = buildTransactionApiUrl({
    apiName: TRANSACTION_APIS.EtherscanScanBlock,
    testApi: isTestChain,
    searchValue: BLOCK_NUMBER_PLACEHOLDER,
    newValue: blockNumber
  });

  return new Promise((resolve, reject) => {
    return request({ url: etherScanUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        const blockData = responseData.result;
        try {
          let checkConfirmationsFetcher = checkEtherScanConfirmations(blockNumber, isTestChain);
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

function parseEtherScanResponse (jsonResponse, block) {
  const data = jsonResponse.result;
  const date = new Date(parseInt(block.timestamp, 16) * 1000);
  const issuingAddress = data.from;
  const opReturnScript = stripHashPrefix(data.input, BLOCKCHAINS.ethmain.prefixes); // remove '0x'

  // The method of checking revocations by output spent do not work with Ethereum.
  // There are no input/outputs, only balances.
  return new TransactionData(opReturnScript, issuingAddress, date, undefined);
}
