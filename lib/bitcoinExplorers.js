import {request} from "./promisifiedRequests";
import {TransactionData} from "./verifierModels";
import {Blockchain, MininumConfirmations, VerifierError, Url} from '../config/default';
import { dateToUnixTimestamp } from './utils';

require('string.prototype.startswith');

export function getBlockcypherFetcher(transactionId, chain) {
  let blockCypherUrl;
  if (chain === Blockchain.bitcoin) {
    blockCypherUrl = Url.blockCypherUrl + transactionId + "?limit=500";
  } else {
    blockCypherUrl = Url.blockCypherTestUrl + transactionId + "?limit=500";
  }
  let blockcypherFetcher = new Promise((resolve, reject) => {
    return request({url: blockCypherUrl})
      .then(function (response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseBlockCypherResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(err);
        }
      }).catch(function (err) {
        reject(new VerifierError(err));
      });
  });
  return blockcypherFetcher;
}

export function getChainSoFetcher(transactionId, chain) {
  let chainSoUrl;
  if (chain === Blockchain.bitcoin) {
    chainSoUrl = Url.chainSoUrl + transactionId;
  } else {
    chainSoUrl = Url.chainSoTestUrl + transactionId;
  }

  let chainSoFetcher = new Promise((resolve, reject) => {
    return request({url: chainSoUrl})
      .then(function (response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseChainSoResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(err);
        }
      }).catch(function (err) {
        reject(new VerifierError(err));
      });
  });
  return chainSoFetcher;
}

function parseBlockCypherResponse(jsonResponse) {
  if (jsonResponse.confirmations < MininumConfirmations) {
    throw new VerifierError("Number of transaction confirmations were less than the minimum required, according to Blockcypher API");
  }
  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = cleanupRemoteHash(lastOutput.script);
  var revokedAddresses = outputs
    .filter((output) => !!output.spent_by)
    .map((output) => output.addresses[0]);
  return new TransactionData(opReturnScript, issuingAddress, time, revokedAddresses);
}

function parseChainSoResponse(jsonResponse) {
  if (jsonResponse.data.confirmations < MininumConfirmations) {
    throw new VerifierError("Number of transaction confirmations were less than the minimum required, according to Chain.so API");
  }
  const time = new Date(jsonResponse.data.time * 1000);
  const outputs = jsonResponse.data.outputs;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.data.inputs[0].address;
  const opReturnScript = cleanupRemoteHash(lastOutput.script);
  // Legacy v1.2 verification notes:
  // Chain.so requires that you lookup spent outputs per index, which would require potentially a lot of calls. However,
  // this is only for v1.2 so we will allow connectors to omit revoked addresses. Blockcypher returns revoked addresses,
  // and ideally we would provide at least 1 more connector to crosscheck the list of revoked addresses. There were very
  // few v1.2 issuances, but you want to provide v1.2 verification with higher confidence (of cross-checking APIs), then
  // you should consider adding an additional lookup to crosscheck revocation addresses.
  return new TransactionData(opReturnScript, issuingAddress, time, undefined);
}

function cleanupRemoteHash(remoteHash) {
  let prefixes = ["6a20", "OP_RETURN "];
  for (var i = 0; i < prefixes.length; i++) {
    let prefix = prefixes[i];
    if (remoteHash.startsWith(prefix)) {
      return remoteHash.slice(prefix.length);
    }
  }
  return remoteHash;
}