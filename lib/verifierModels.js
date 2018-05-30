'use strict';

import {request} from './promisifiedRequests'
import {VerifierError} from '../config/default';
import { dateToUnixTimestamp } from './utils';

export class TransactionData {
  constructor(remoteHash, issuingAddress, time, revokedAddresses) {
    this.remoteHash = remoteHash;
    this.issuingAddress = issuingAddress;
    this.time = time;
    this.revokedAddresses = revokedAddresses;
  }
}

export class Key {
  constructor(publicKey, created, revoked, expires) {
    this.publicKey = publicKey;
    this.created = created;
    this.revoked = revoked;
    this.expires = expires;
  }
}

export function parseIssuerKeys(issuerProfileJson) {
  try {
    var keyMap = {};
    if ('@context' in issuerProfileJson) {
      // backcompat for v2 alpha
      var responseKeys = issuerProfileJson.publicKey || issuerProfileJson.publicKeys;
      for (var i = 0; i < responseKeys.length; i++) {
        var key = responseKeys[i];
        var created = key.created ? dateToUnixTimestamp(key.created) : null;
        var revoked = key.revoked ? dateToUnixTimestamp(key.revoked) : null;
        var expires = key.expires ? dateToUnixTimestamp(key.expires) : null;
        // backcompat for v2 alpha
        var publicKeyTemp = key.id || key.publicKey;
        var publicKey = publicKeyTemp.replace('ecdsa-koblitz-pubkey:', '');
        var k = new Key(publicKey, created, revoked, expires);
        keyMap[k.publicKey] = k;
      }
    } else {
      // This is a v2 certificate with a v1 issuer
      const issuerKeys = issuerProfileJson.issuerKeys || [];
      var issuerKey = issuerKeys[0].key;
      var k = new Key(issuerKey, null, null, null);
      keyMap[k.publicKey] = k;
    }
    return keyMap;
  } catch (e) {
    throw new VerifierError(e, "Unable to parse JSON out of issuer identification data.");
  }
};

export function parseRevocationKey(issuerProfileJson) {
  if (issuerProfileJson.revocationKeys && issuerProfileJson.revocationKeys.length > 0) {
   return issuerProfileJson.revocationKeys[0].key;
  }
  return null;
}

export function getIssuerProfile(issuerId) {
  let issuerProfileFetcher = new Promise((resolve, reject) => {
    return request({url: issuerId})
        .then(function (response) {
          try {
            let issuerProfileJson = JSON.parse(response);
            resolve(issuerProfileJson);
          } catch (err) {
            reject(new VerifierError(err));
          }
        }).catch(function (err) {
          reject(new VerifierError(err));
        });
  });
  return issuerProfileFetcher;
}

export function getIssuerKeys(issuerId) {
  let issuerKeyFetcher = new Promise((resolve, reject) => {
    return getIssuerProfile(issuerId)
        .then(function (issuerProfileJson) {
          try {
            let issuerKeyMap = parseIssuerKeys(issuerProfileJson);
            resolve(issuerKeyMap);
          } catch (err) {
            reject(new VerifierError(err));
          }
        }).catch(function (err) {
          reject(new VerifierError(err));
        });
  });
  return issuerKeyFetcher;

}

export function getRevokedAssertions(revocationListUrl) {
  if (!revocationListUrl) {
    return Promise.resolve([]);
  }
  let revocationListFetcher = new Promise((resolve, reject) => {
    return request({url: revocationListUrl})
        .then(function (response) {
          try {
            let issuerRevocationJson = JSON.parse(response);
            let revokedAssertions = issuerRevocationJson.revokedAssertions ? issuerRevocationJson.revokedAssertions : [];
            resolve(revokedAssertions);
          } catch (err) {
            reject(new VerifierError(err));
          }
        }).catch(function (err) {
          reject(new VerifierError(err));
        });
  });
  return revocationListFetcher;
}
