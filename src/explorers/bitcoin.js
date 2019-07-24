import { request } from '../services';
import { dateToUnixTimestamp } from '../helpers/date';
import { API_URLS, BLOCKCHAINS, CONFIG, SUB_STEPS } from '../constants';
import { TransactionData, VerifierError } from '../models';
import { stripHashPrefix } from './utils/stripHashPrefix';
import { getText } from '../domain/i18n/useCases';

export function getBlockcypherFetcher (transactionId, chain) {
  let blockCypherUrl;
  if (chain === BLOCKCHAINS.bitcoin.code) {
    blockCypherUrl = API_URLS.blockCypherUrl + transactionId + '?limit=500';
  } else {
    blockCypherUrl = API_URLS.blockCypherTestUrl + transactionId + '?limit=500';
  }
  let blockcypherFetcher = new Promise((resolve, reject) => {
    return request({ url: blockCypherUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseBlockCypherResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(err.message);
        }
      })
      .catch(function () {
        reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'getBlockcypherFetcher')));
      });
  });
  return blockcypherFetcher;
}

export function getChainSoFetcher (transactionId, chain) {
  let chainSoUrl;
  if (chain === BLOCKCHAINS.bitcoin.code) {
    chainSoUrl = API_URLS.chainSoUrl + transactionId;
  } else {
    chainSoUrl = API_URLS.chainSoTestUrl + transactionId;
  }

  let chainSoFetcher = new Promise((resolve, reject) => {
    return request({ url: chainSoUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseChainSoResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'getChainSoFetcher')));
        }
      })
      .catch(function () {
        reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'getChainSoFetcher')));
      });
  });
  return chainSoFetcher;
}

function parseBlockCypherResponse (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockCypherResponse'));
  }
  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = stripHashPrefix(lastOutput.script, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spent_by)
    .map(output => output.addresses[0]);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}

function parseChainSoResponse (jsonResponse) {
  if (jsonResponse.data.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseChainSoResponse'));
  }
  const time = new Date(jsonResponse.data.time * 1000);
  const outputs = jsonResponse.data.outputs;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.data.inputs[0].address;
  const opReturnScript = stripHashPrefix(lastOutput.script, BLOCKCHAINS.bitcoin.prefixes);
  // Legacy v1.2 verification notes:
  // Chain.so requires that you lookup spent outputs per index, which would require potentially a lot of calls. However,
  // this is only for v1.2 so we will allow connectors to omit revoked addresses. Blockcypher returns revoked addresses,
  // and ideally we would provide at least 1 more connector to crosscheck the list of revoked addresses. There were very
  // few v1.2 issuances, but you want to provide v1.2 verification with higher confidence (of cross-checking APIs), then
  // you should consider adding an additional lookup to crosscheck revocation addresses.
  return new TransactionData(opReturnScript, issuingAddress, time, undefined);
}
