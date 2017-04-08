'use strict';

var jsonld = require('jsonld');
var sha256 = require('sha256');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bitcoin = require('bitcoinjs-lib');
const VError = require('verror');
var Status = require('./status');
var Certificate = require('./certificate');
var CertificateVersion = require('./certificateVersion');

const SECURITY_CONTEXT_URL = "https://w3id.org/security/v1";


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
    url = "https://api.blockcypher.com/v1/btc/main/txs/" + transactionId;
  } else {
    url = "http://api.blockcypher.com/v1/btc/test3/txs/" + transactionId;
  }
  return url;
};


class TransactionData {
  constructor(remoteHash, time, revokedAddresses) {
    this.remoteHash = remoteHash;
    this.time = time;
    this.revokedAddresses = revokedAddresses;
  }
}

var parseTxResponse = function (jsonResponse) {
  const time = jsonResponse.received;
  const outputs = jsonResponse.outputs;
  var lastOutput = outputs[outputs.length - 1];
  const opReturnScript = lastOutput.data_hex;
  const revokedAddresses = outputs
    .filter((output) => !!output.spent_by)
    .map((output) => output.addresses[0]);
  return new TransactionData(opReturnScript, time, revokedAddresses);
};


class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    const certificateJson = JSON.parse(certificateString);
    this.certificate = Certificate.parseJson(certificateJson);

    let document = certificateJson.document;
    if (!document) {
      delete certificateJson.signature.merkleProof;
      this.documentWithSignature = certificateJson;
      // TODO: clean this up
      var certCopy = JSON.parse(certificateString);
      delete certCopy["signature"];
      document = certCopy;
      //this.documentWithSignature.signature.type = "EcdsaKoblitzSignature2016";
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
      jsonld.normalize(this.document, {
        algorithm: 'URDNA2015',
        format: 'application/nquads'
      }, (err, normalized) => {
        if (!!err) {
          var reason = "Failed JSON-LD normalization";
          return this._failed(completionCallback, reason, err);
        } else {
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

    this._checkIssuerSignature(completionCallback);
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
        if (this.certificate.version === CertificateVersion.v2_0) {
          issuerKey = responseData.publicKey;

          // This was used for jsonld-signatures library, but that had browserification issues. Eventually we should
          // optionally validate with jsonld-signatures as well.
          /*
           var publicKeyBtc = {
           '@context': SECURITY_CONTEXT_URL,
           id: "ecdsa-koblitz-pubkey:" + issuerKey,
           type: 'CryptographicKey',
           owner: this.certificate.signature.creator,
           publicKeyWif: issuerKey
           };

           var publicKeyBtcOwner = {
           '@context': SECURITY_CONTEXT_URL,
           id: this.certificate.issuer.id,
           publicKey: ["ecdsa-koblitz-pubkey:" + issuerKey]
           };*/

          let options = {};
          options.date = this.documentWithSignature.signature.created;
          options.algorithm = "EcdsaKoblitzSignature2016";
          const signature = this.certificate.signature;
          const normalized = this._verificationState.normalized;
          const toHash = _getDataToHash(normalized, options = options);

          if (!bitcoin.message.verify(issuerKey, this.certificate.signature, toHash, this._verificationState.chain)) {
            var reason = "Issuer key doesn't match derived address.";
            return this._failed(completionCallback, reason, null);
          }
          this._checkRevokedStatus(completionCallback);
        } else {
          const issuerKeys = responseData.issuerKeys || [];
          const revocationKeys = responseData.revocationKeys || [];
          issuerKey = issuerKeys[0].key;
          revocationKey = revocationKeys[0].key;
          if (!bitcoin.message.verify(issuerKey, this.certificate.signature, this.certificate.uid)) {
            // TODO: `Issuer key doesn't match derived address. Address: ${address}, Issuer Key: ${issuerKey}`
            var reason = "Issuer key doesn't match derived address.";
            return this._failed(completionCallback, reason, null);
          }
          this._verificationState.issuerKey = issuerKey;
          this._verificationState.revocationKey = revocationKey;
          this._checkRevokedStatus(completionCallback);
        }

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
            .map((output) => output.id); // TODO: remove urn:uuid:
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

function _getDataToHash(input, options) {
  var toHash = '';
  if (options.algorithm === 'GraphSignature2012') {
    if (options.nonce !== null && options.nonce !== undefined) {
      toHash += options.nonce;
    }
    toHash += options.date;
    toHash += input;
    if (options.domain !== null && options.domain !== undefined) {
      toHash += '@' + options.domain;
    }
  } else {
    var headers = {
      'http://purl.org/dc/elements/1.1/created': options.date,
      'https://w3id.org/security#domain': options.domain,
      'https://w3id.org/security#nonce': options.nonce
    };
    // add headers in lexicographical order
    var keys = Object.keys(headers).sort();
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      var value = headers[key];
      if (value !== null && value !== undefined) {
        toHash += key + ': ' + value + '\n';
      }
    }
    toHash += input;
  }
  return toHash;
}

module.exports = CertificateVerifier;

/*
 var fs = require('fs');

 function statusCallback(arg1) {
 console.log("status=" + arg1);
 }

 fs.readFile('../tests/sample_signed_cert-revoked-2.0-alpha.json', 'utf8', function (err, data) {
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