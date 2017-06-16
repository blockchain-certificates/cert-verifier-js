'use strict';

var jsonld = require('jsonld');
var sha256 = require('sha256');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bitcoin = require('bitcoinjs-lib');
const VError = require('verror');
import { Status } from './status';
import { Certificate } from './certificate'
import { CertificateVersion } from './certificateVersion'
var async = require('async');
var path = require('path');

const SECURITY_CONTEXT_URL = "https://w3id.org/security/v1";


var fs = require('fs');

const CONTEXTS = {};
const PRELOADED_CONTEXT_MAPPING = {};

const DIR_NAME = __dirname;

PRELOADED_CONTEXT_MAPPING["https://w3id.org/blockcerts/schema/2.0-alpha/context.json"] =
  path.join(DIR_NAME, "contexts/blockcerts.json");
PRELOADED_CONTEXT_MAPPING["https://www.blockcerts.org/schema/2.0-alpha/context.json"] =
  path.join(DIR_NAME, "contexts/blockcerts.json");
PRELOADED_CONTEXT_MAPPING["https://openbadgespec.org/v2/context.json"] =
  path.join(DIR_NAME, "contexts/obi.json");


var noop = function () {
};


var getTxUrlsAndParsers = function (transactionId, chain) {
  let blockCypherUrl;
  if (chain === bitcoin.networks.bitcoin) {
    blockCypherUrl = "https://api.blockcypher.com/v1/btc/main/txs/" + transactionId + "?limit=500";
  } else {
    blockCypherUrl = "https://api.blockcypher.com/v1/btc/test3/txs/" + transactionId + "?limit=500";
  }
  let blockCypherHandler = {
    url: blockCypherUrl,
    parser: parseBlockCypherResponse
  };

  let blockrIoUrl;
  if (chain === bitcoin.networks.bitcoin) {
    blockrIoUrl = "https://btc.blockr.io/api/v1/tx/info/" + transactionId;
  } else {
    blockrIoUrl = "https://tbtc.blockr.io/api/v1/tx/info/" + transactionId;
  }
  let blockrIoHandler = {
    url: blockrIoUrl,
    parser: parseBlockrIoResponse
  };

  return [blockCypherHandler, blockrIoHandler];
};


class TransactionData {
  constructor(remoteHash, issuingAddress, time, revokedAddresses) {
    this.remoteHash = remoteHash;
    this.issuingAddress = issuingAddress;
    this.time = time;
    this.revokedAddresses = revokedAddresses;
  }
}

class Key {
  constructor(publicKey, created, revoked, expires) {
    this.publicKey = publicKey;
    this.created = created;
    this.revoked = revoked;
    this.expires = expires;
  }
}

var parseBlockCypherResponse = function (jsonResponse) {
  const time = jsonResponse.received;
  const outputs = jsonResponse.outputs;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = lastOutput.data_hex;
  const revokedAddresses = outputs
    .filter((output) => !!output.spent_by)
    .map((output) => output.addresses[0]);
  return new TransactionData(opReturnScript, issuingAddress, time, revokedAddresses);
};

var parseBlockrIoResponse = function (jsonResponse) {
  const time = jsonResponse.data.time_utc;
  const outputs = jsonResponse.data.vouts;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.data.vins[0].address;

  const opReturnScript = lastOutput.extras.script.substr(4); // remove first 4 chars
  const revokedAddresses = outputs
    .filter((output) => output.is_spent != null && output.is_spent == 49)
    .map((output) => output.address);
  return new TransactionData(opReturnScript, issuingAddress, time, revokedAddresses);
};

export class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    const certificateJson = JSON.parse(certificateString);
    this.certificate = Certificate.parseJson(certificateJson);

    let document = certificateJson.document;
    if (!document) {
      this.documentWithSignature = certificateJson;
      var certCopy = JSON.parse(certificateString);
      delete certCopy["signature"];
      document = certCopy;
    }
    this.document = document;
    this.statusCallback = statusCallback || noop;
    // v1.1 only
    this.certificateString = certificateString;
  }

  _succeed(completionCallback) {
    this.statusCallback(Status.success);
    return completionCallback(null, Status.success);
  }

  _failed(completionCallback, reason, err) {
    this.statusCallback(Status.failure, reason);
    var e;
    if (err) {
      e = new VError(err, reason);
    } else {
      e = new VError(reason);
    }
    return completionCallback(e, reason);
  }

  _lookForTx(index, items, completionCallback) {
    if (index >= items.length) {
      return this._failed(completionCallback,
        'Could not fetch or parse remote transaction data');
    }
    var item = items[index];
    var request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      var status = request.status;
      if (status != 200) {
        // try next handler
        return this._lookForTx(index + 1, items, completionCallback);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        const txData = item.parser(responseData);
        this._verificationState.remoteHash = txData.remoteHash;
        this._verificationState.revokedAddresses = txData.revokedAddresses;
        this._verificationState.txIssuingAddress = txData.issuingAddress;
        this._verificationState.time = txData.time;
        return this._compareHashes(completionCallback);
      } catch (e) {
        // try next handler
        return this._lookForTx(index + 1, items, completionCallback);
      }
    });
    request.open('GET', item.url);
    request.responseType = "json";
    request.send();
  }

  verify(completionCallback) {
    completionCallback = completionCallback || noop;
    this._verificationState = {};
    this._computeLocalHash(completionCallback);
  }

  _computeLocalHash(completionCallback) {

    this.statusCallback(Status.computingLocalHash);

    if (this.certificate.version === CertificateVersion.v1_1) {
      // When getting the file over HTTP, we've seen an extra newline be appended. This removes that.
      var correctedData = this.certificateString.slice(0, -1);
      this._verificationState.localHash = sha256(correctedData);
      this._fetchRemoteHash();
    } else {
      var expandContext = this.document["@context"];
      var theDocument = this.document;
      var outerThis = this;
      if (this.certificate.version === CertificateVersion.v2_0) {
        expandContext.push({"@vocab":  "http://fallback.org/"});
      }
      async.eachSeries(
        Object.keys(PRELOADED_CONTEXT_MAPPING),
        function(key, cb) {
          var filename = PRELOADED_CONTEXT_MAPPING[key];
          outerThis._preloadContext(key, filename, outerThis, completionCallback, cb, CONTEXTS);
        },
        function(err) {
          outerThis._setCustomLoader();

          jsonld.normalize(theDocument, {
            algorithm: 'URDNA2015',
            format: 'application/nquads',
            expandContext: expandContext
          }, (err, normalized) => {
            if (!!err) {
              var reason = "Failed JSON-LD normalization";
              return outerThis._failed(completionCallback, reason, err);
            } else {

              var myRegexp = /<http:\/\/fallback\.org\/(.*)>/;
              var matches = myRegexp.exec(normalized);
              if (matches) {
                var unmappedFields = Array();
                for (var i = 0; i < matches.length; i++) {
                  unmappedFields.push(matches[i]);
                }
                var reason = "Found unmapped fields during JSON-LD normalization: " + unmappedFields.join(",");
                return outerThis._failed(completionCallback, reason, err);
              }
              outerThis._verificationState.normalized = normalized;
              outerThis._verificationState.localHash = sha256(outerThis._toUTF8Data(normalized));
              outerThis._fetchRemoteHash(completionCallback);
            }
          });
        });
    }
  }

  _setCustomLoader() {
    var nodeDocumentLoader = jsonld.documentLoaders.node();
    var customLoader = function (url, callback) {
      if (url in CONTEXTS) {
        return callback(
          null, {
            contextUrl: null,
            document: CONTEXTS[url],
            documentUrl: url
          });
      }
      nodeDocumentLoader(url, callback);
    };
    jsonld.documentLoader = customLoader;
  }

  _preloadContext(key, filename, outerThis, completionCallback, cb, contexts) {
    fs.readFile(filename, 'utf-8', function (err, content) {
      if (err) {
        var reason = "Couldn't load embedded schema";
        return outerThis._failed(completionCallback, reason, err);
      }
      var json = JSON.parse(content);
      contexts[key] = json;
      cb(err);
    });
  }

  _fetchRemoteHash(completionCallback) {
    this.statusCallback(Status.fetchingRemoteHash);

    var transactionID;
    try {
      const receipt = this.certificate.receipt;
      transactionID = receipt.anchors[0].sourceId;
    } catch (e) {
      var reason = "Can't verify this certificate without a transaction ID to compare against.";
      return this._failed(completionCallback, reason, e);
    }

    const chain = this.certificate.chain;
    this._verificationState.chain = chain;
    let handlers = getTxUrlsAndParsers(transactionID, chain);

    return this._lookForTx(0, handlers, completionCallback);
  }

  _compareHashes(completionCallback) {
    this.statusCallback(Status.comparingHashes);
    var compareToHash = "";

    if (this.certificate.version === CertificateVersion.v1_1) {
      const prefix = "6a20";
      var remoteHash = this._verificationState.remoteHash;
      if (remoteHash.startsWith(prefix)) {
        remoteHash = remoteHash.slice(prefix.length);
      }
      compareToHash = remoteHash
    } else {
      compareToHash = this.certificate.receipt.targetHash;
    }

    if (this._verificationState.localHash !== compareToHash) {
      var reason = "Local hash does not match remote hash";
      return this._failed(completionCallback, reason, null);
    }

    if (this.certificate.version === CertificateVersion.v1_1) {
      this._checkIssuerSignature(completionCallback);
    } else {
      this._checkMerkleRoot(completionCallback);
    }
  }

  _checkMerkleRoot(completionCallback) {
    this.statusCallback(Status.checkingMerkleRoot);

    var merkleRoot = this.certificate.receipt.merkleRoot;

    const remoteHash = this._verificationState.remoteHash;
    if (merkleRoot !== remoteHash) {
      var reason = "Merkle root does not match remote hash.";
      return this._failed(completionCallback, reason, null);
    }
    this._checkReceipt(completionCallback);
  }

  _checkReceipt(completionCallback) {
    this.statusCallback(Status.checkingReceipt);

    const receipt = this.certificate.receipt;
    var proofHash = receipt.targetHash;
    var merkleRoot = receipt.merkleRoot;
    try {
      var proof = receipt.proof;
      if (!!proof) {
        for (var index in proof) {
          const node = proof[index];
          if (typeof node.left !== "undefined") {
            var appendedBuffer = this._toByteArray(`${node.left}${proofHash}`);
            proofHash = sha256(appendedBuffer);
          } else if (typeof node.right !== "undefined") {
            var appendedBuffer = this._toByteArray(`${proofHash}${node.right}`);
            proofHash = sha256(appendedBuffer);
          } else {
            throw new Error("We should never get here.");
          }
        }
      }
    } catch (e) {
      var reason = "The receipt is malformed. There was a problem navigating the merkle tree in the receipt.";
      return this._failed(completionCallback, reason, e);
    }

    if (proofHash !== merkleRoot) {
      var reason = "Invalid Merkle Receipt. Proof hash didn't match Merkle root";
      return this._failed(completionCallback, reason, null);
    }

    if (this.certificate.version == CertificateVersion.v2_0) {
      // in v2 we don't check the issuer signature, and we check authenticity
      this._checkAuthenticity(completionCallback);
    } else {
      this._checkIssuerSignature(completionCallback);
    }
  }

  _checkAuthenticity(completionCallback) {
    this.statusCallback(Status.checkingAuthenticity);

    var issuer = this.certificate.issuer;
    var issuerURL = issuer.id;
    var request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        var reason = "Got unexpected response when trying to get remote issuer data; " + request.status;
        return this._failed(completionCallback, reason, null);
      }
      try {
        const responseData = JSON.parse(request.responseText);

        var keyMap = {};
        if ('@context' in responseData) {
          var responseKeys = responseData.publicKeys;
          for (var i=0; i<responseKeys.length; i++) {
            var key = responseKeys[i];
            var created = key.created || null;
            var revoked = key.revoked || null;
            var expires = key.expires || null;
            var publicKey = key.publicKey.replace('ecdsa-koblitz-pubkey:','');
            var k = new Key(publicKey, created, revoked, expires);
            keyMap[k.publicKey] = k;
          }
        } else {
          // This is a v2 certificate with a v1 issuer
          const issuerKeys = responseData.issuerKeys || [];
          var issuerKey = issuerKeys[0].key;
          var k = new Key(issuerKey, null, null, null);
          keyMap[k.publicKey] = k;
        }

        let txAddress = this._verificationState.txIssuingAddress;
        let txTime = this._verificationState.time;
        var validKey = false;
        if (txAddress in keyMap) {
          validKey = true;
          var theKey = keyMap[txAddress];
          this._verificationState.issuerKey = txAddress;
          if (theKey.created) {
            validKey &= txTime >= key.created;
          }
          if (theKey.revoked) {
            validKey &= txTime <= key.revoked;
          }
          if (theKey.expires) {
            validKey &= txTime <= key.expires;
          }
        }

        if (!validKey) {
          return this._failed(completionCallback, "Transaction occurred at time when issuing address was not considered valid.", null);
        }

        this._checkRevokedStatus(completionCallback);

      } catch (e) {
        var reason = "Unable to parse JSON out of issuer identification data.";
        return this._failed(completionCallback, reason, e);
      }

    });
    request.addEventListener('error', () => {
      console.log(request.status);
      return this._failed(completionCallback, "Error requesting issuer identification.", null);
    });

    request.open('GET', issuerURL);
    request.send();
  }

  _checkIssuerSignature(completionCallback) {
    this.statusCallback(Status.checkingIssuerSignature);

    var issuer = this.certificate.issuer;
    var issuerURL = issuer.id;
    var request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        var reason = "Got unexpected response when trying to get remote transaction data; " + request.status;
        return this._failed(completionCallback, reason, null);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        let issuerKey;
        let revocationKey = null;

        const issuerKeys = responseData.issuerKeys || [];
        const revocationKeys = responseData.revocationKeys || [];
        issuerKey = issuerKeys[0].key;
        revocationKey = revocationKeys[0].key;
        if (!bitcoin.message.verify(issuerKey, this.certificate.signature, this.certificate.id,
            this.certificate.chain)) {
          // TODO: `Issuer key doesn't match derived address. Address: ${address}, Issuer Key: ${issuerKey}`
          var reason = "Issuer key doesn't match derived address.";
          return this._failed(completionCallback, reason, null);
        }
        this._verificationState.issuerKey = issuerKey;
        this._verificationState.revocationKey = revocationKey;
        this._checkRevokedStatus(completionCallback);

      } catch (e) {
        var reason = "Unable to parse JSON out of issuer signature data.";
        return this._failed(completionCallback, reason, e);
      }

    });
    request.addEventListener('error', () => {
      return this._failed(completionCallback, "Error requesting issuer signature.", null);
    });

    request.open('GET', issuerURL);
    request.send();
  }

  _checkRevokedStatus(completionCallback) {
    this.statusCallback(Status.checkingRevokedStatus);

    if (this.certificate.version == CertificateVersion.v2_0) {
      if (!this.certificate.issuer.revocationList) {
        // nothing to do
        return this._succeed(completionCallback);
      }

      var request = new XMLHttpRequest();
      request.addEventListener('load', () => {
        var status = request.status;
        if (status != 200) {
          var reason = "Got unexpected response when trying to get remote revocation data; " + status;
          return this._failed(completionCallback, reason);
        }
        try {
          const responseData = JSON.parse(request.responseText);
          const revokedAddresses = responseData.revokedAssertions
            .map((output) => output.id);
          this._verificationState.revokedAddresses = revokedAddresses;
          const assertionId = this.certificate.id;
          const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((id) => id === assertionId));
          if (isRevokedByIssuer) {
            var reason = "This certificate has been revoked by the issuer.";
            return this._failed(completionCallback, reason, null);
          }
          this._checkExpiryDate(completionCallback);
        } catch (e) {
          var reason = "Unable to parse JSON out of remote revocation data.";
          return this._failed(completionCallback, reason, e);
        }
      });
      let url = this.certificate.issuer.revocationList;
      request.open('GET', url);
      request.responseType = "json";
      request.send();
    } else {
      const revokedAddresses = this._verificationState.revokedAddresses;
      var revocationKey = this._verificationState.revocationKey;
      const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((address) => address === revocationKey));
      if (isRevokedByIssuer) {
        var reason = "This certificate batch has been revoked by the issuer.";
        return this._failed(completionCallback, reason, e);
      }

      revocationKey = this.certificate.revocationKey;
      const isRevokedByRecipient = (-1 != revokedAddresses.findIndex((address) => address === revocationKey));
      if (isRevokedByRecipient) {
        var reason = "This recipient's certificate has been revoked.";
        return this._failed(completionCallback, reason, e);
      }

      this._checkExpiryDate(completionCallback);
    }

  }

  _checkExpiryDate(completionCallback) {
    this.statusCallback(Status.checkingExpiresDate);

    if (!this.certificate.expires) {
      // expiry date not set, nothing to do
      return this._succeed(completionCallback);
    }

    var expiryDate = Date.parse(this.certificate.expires);

    if (new Date() >= expiryDate) {
      var reason = "This certificate has expired.";
      return this._failed(completionCallback, reason, null);
    }

    return this._succeed(completionCallback);
  }

  // Helper functions
  _toUTF8Data(string) {
    var utf8 = [];
    for (var i = 0; i < string.length; i++) {
      var charcode = string.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6),
          0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f));
      }
      // surrogate pair
      else {
        i++;
        // UTF-16 encodes 0x10000-0x10FFFF by
        // subtracting 0x10000 and splitting the
        // 20 bits of 0x0-0xFFFFF into two halves
        charcode = 0x10000 + (((charcode & 0x3ff) << 10)
          | (string.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f));
      }
    }
    return utf8;
  }

  _toByteArray(hexString) {
    var outArray = [];
    var byteSize = 2;
    for (var i = 0; i < hexString.length; i += byteSize) {
      outArray.push(parseInt(hexString.substring(i, i + byteSize), 16));
    }
    return outArray;
  }

  _hexFromByteArray(byteArray) {
    var out = "";
    for (var i = 0; i < byteArray.length; ++i) {
      var value = byteArray[i];
      if (value < 16) {
        out += "0" + value.toString(16)
      } else {
        out += value.toString(16)
      }
    }
    return out;
  }
}

/*
function statusCallback(arg1) {
  console.log("status=" + arg1);
}

fs.readFile('../tests/data/certificate_fail.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }
  var certVerifier = new CertificateVerifier(data, statusCallback);

  certVerifier.verify(function (err, data) {
    if (err) {
      console.log("failed");
      console.log(data);
      //console.log(err);
    } else {
      console.log("done");
    }
  });

});
*/
