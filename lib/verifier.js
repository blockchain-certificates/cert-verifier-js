'use strict';

var jsonld = require('jsonld');
var sha256 = require('sha256');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bitcoin = require('bitcoinjs-lib');
const VError = require('verror');
import { Status } from './index';
import { Certificate } from './index'
import { CertificateVersion } from './index'

const SECURITY_CONTEXT_URL = "https://w3id.org/security/v1";
var GUID_REGEX = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;


var noop = function () {
};


var getChainForAddress = function (publicKey) {
  if (publicKey.startsWith("1")) {
    return bitcoin.networks.mainnet;
  } else {
    return bitcoin.networks.testnet;
  }
};


var getTxUrlForChain = function (transactionId, chain) {
  let url;
  if (chain === bitcoin.networks.mainnet) {
    url = "https://api.blockcypher.com/v1/btc/main/txs/" + transactionId + "?limit=500";
  } else {
    url = "http://api.blockcypher.com/v1/btc/test3/txs/" + transactionId + "?limit=500";
  }
  return url;
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

var parseTxResponse = function (jsonResponse) {
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
      if (this.certificate.version === CertificateVersion.v2_0) {
        expandContext.push({"@vocab":  "http://fallback.org/"});
      }
      jsonld.normalize(this.document, {
        algorithm: 'URDNA2015',
        format: 'application/nquads',
        expandContext: expandContext
      }, (err, normalized) => {
        if (!!err) {
          var reason = "Failed JSON-LD normalization";
          return this._failed(completionCallback, reason, err);
        } else {

          var myRegexp = /<http:\/\/fallback\.org\/(.*)>/;
          var matches = myRegexp.exec(normalized);
          if (matches) {
            var unmappedFields = Array();
            for (var i = 0; i < matches.length; i++) {
              unmappedFields.push(matches[i]);
            }
            var reason = "Found unmapped fields during JSON-LD normalization: " + unmappedFields.join(",");
            return this._failed(completionCallback, reason, err);
          }
          this._verificationState.normalized = normalized;
          this._verificationState.localHash = sha256(this._toUTF8Data(normalized));
          this._fetchRemoteHash(completionCallback);
        }
      });
    }
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

    var request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      var status = request.status;
      if (status != 200) {
        var reason = "Got unexpected response when trying to get remote transaction data; " + status;
        return this._failed(completionCallback, reason);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        const txData = parseTxResponse(responseData);
        this._verificationState.remoteHash = txData.remoteHash;
        this._verificationState.revokedAddresses = txData.revokedAddresses;
        this._verificationState.txIssuingAddress = txData.issuingAddress;
        this._verificationState.time = txData.time;
      } catch (e) {
        var reason = "Unable to parse JSON out of remote transaction data.";
        return this._failed(completionCallback, reason, e);
      }

      this._compareHashes(completionCallback);
    });
    const chain = getChainForAddress(this.certificate.publicKey);
    this._verificationState.chain = chain;
    let url = getTxUrlForChain(transactionID, chain);
    request.open('GET', url);
    request.responseType = "json";
    request.send();
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
        if (!bitcoin.message.verify(issuerKey, this.certificate.signature, this.certificate.uid,
            getChainForAddress(issuerKey))) {
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
            .map((output) => GUID_REGEX.exec(output.id)[0]);
          this._verificationState.revokedAddresses = revokedAddresses;
          const recipientUid = this.certificate.uid;
          const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((uid) => uid === recipientUid));
          if (isRevokedByIssuer) {
            var reason = "This certificate has been revoked by the issuer.";
            return this._failed(completionCallback, reason, null);
          }
          return this._succeed(completionCallback);
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

      return this._succeed(completionCallback);
    }

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
var fs = require('fs');

function statusCallback(arg1) {
  console.log("status=" + arg1);
}

fs.readFile('../tests/sample_cert-with_v1_issuer-no_revocation_url-2.0.json', 'utf8', function (err, data) {
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