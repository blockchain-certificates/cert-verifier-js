'use strict';

import debug from 'debug';
import {TransactionData} from './verifierModels';
import {Blockchain, CertificateVersion, MinimumBlockchainExplorers, MininumConfirmations, Race, VerifierError, Url} from '../config/default';
import {request} from './promisifiedRequests'

const log = debug("bitcoinConnectors");

require('string.prototype.startswith');

const BlockchainExplorers = [
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain),
  (transactionId, chain) => getChainSoFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain)
];

function cleanupRemoteHash(remoteHash) {
  let prefixes = ["6a20", "OP_RETURN "];
  for (var i = 0; i < prefixes.length; i++) {
    let prefix = prefixes[i];
    if (remoteHash.startsWith(prefix)) {
      return remoteHash.slice(prefix.length);
    }
  }
  return remoteHash;
};

function getBlockcypherFetcher(transactionId, chain) {
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

function getChainSoFetcher(transactionId, chain) {
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
  const time = Date.parse(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = cleanupRemoteHash(lastOutput.script);
  var revokedAddresses = outputs
      .filter((output) => !!output.spent_by)
      .map((output) => output.addresses[0]);
  return new TransactionData(opReturnScript, issuingAddress, time, revokedAddresses);
};

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


export function lookForTx(transactionId, chain, certificateVersion) {
  // First ensure we can satisfy the MinimumBlockchainExplorers setting
  if (MinimumBlockchainExplorers < 0 || MinimumBlockchainExplorers > BlockchainExplorers.length) {
    return Promise.reject(new VerifierError("Invalid application configuration; check the MinimumBlockchainExplorers configuration value"));
  }
  if (MinimumBlockchainExplorers > BlockchainExplorersWithSpentOutputInfo.length &&
      (certificateVersion == CertificateVersion.v1_1 || certificateVersion == CertificateVersion.v1_2)) {
    return Promise.reject(new VerifierError("Invalid application configuration; check the MinimumBlockchainExplorers configuration value"));
  }

  // Queue up blockchain explorer APIs
  let promises = Array();
  if (certificateVersion == CertificateVersion.v1_1 || certificateVersion == CertificateVersion.v1_2) {
    var limit = Race ? BlockchainExplorersWithSpentOutputInfo.length : MinimumBlockchainExplorers;
    for (var i = 0; i < limit; i++) {
      promises.push(BlockchainExplorersWithSpentOutputInfo[i](transactionId, chain));
    }
  } else {
    var limit = Race ? BlockchainExplorers.length : MinimumBlockchainExplorers;
    for (var j = 0; j < limit; j++) {
      promises.push(BlockchainExplorers[j](transactionId, chain));
    }
  }

  return new Promise((resolve, reject) => {
    return Promise.properRace(promises, MinimumBlockchainExplorers).then(winners => {
      if (!winners || winners.length == 0) {
        return Promise.reject(new VerifierError("Could not confirm the transaction. No blockchain apis returned a response. This could be because of rate limiting."));
      }

      // Compare results returned by different blockchain apis. We pick off the first result and compare the others
      // returned. The number of winners corresponds to the configuration setting `MinimumBlockchainExplorers`.
      // We require that all results agree on `issuingAddress` and `remoteHash`. Not all blockchain apis return
      // spent outputs (revoked addresses for <=v1.2), and we do not have enough coverage to compare this, but we do
      // ensure that a TxData with revoked addresses is returned, for the rare case of legacy 1.2 certificates.
      //
      // Note that APIs returning results where the number of confirmations is less than `MininumConfirmations` are
      // filtered out, but if there are at least `MinimumBlockchainExplorers` reporting that the number of confirmations
      // are above the `MininumConfirmations` threshold, then we can proceed with verification.
      var firstResponse = winners[0];
      for (var i = 1; i < winners.length; i++) {
        var thisResponse = winners[i];
        if (firstResponse.issuingAddress !== thisResponse.issuingAddress) {
          throw new VerifierError("Issuing addresses returned by the blockchain APIs were different");
        }
        if (firstResponse.remoteHash !== thisResponse.remoteHash) {
          throw new VerifierError("Remote hashes returned by the blockchain APIs were different");
        }
      }
      resolve(firstResponse);
    }).catch((err) => {
      reject(new VerifierError(err))
    });

  });

}

Promise.properRace = function (promises, count, results = []) {
  // Source: https://www.jcore.com/2016/12/18/promise-me-you-wont-use-promise-race/
  promises = Array.from(promises);
  if (promises.length < count) {
    return Promise.reject(new VerifierError("Could not confirm the transaction"));
  }

  let indexPromises = promises.map((p, index) => p.then(() => index).catch((err) => {
    log(err);
    throw index;
  }));

  return Promise.race(indexPromises).then(index => {
    let p = promises.splice(index, 1)[0];
    p.then(e => results.push(e));
    if (count === 1) {
      return results;
    }
    return Promise.properRace(promises, count - 1, results);
  }).catch(index => {
    promises.splice(index, 1);
    return Promise.properRace(promises, count, results);
  });
};
