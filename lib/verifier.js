'use strict';

var jsonld = require('jsonld');
var sha256 = require('sha256');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bitcoin = require('bitcoinjs-lib');
const VError = require('verror');
var Status = require('./status');

var noop = function(){};

class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    this.certificateString = certificateString;
    this.statusCallback = statusCallback || noop;
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
    var certificate;
    try {
      certificate = JSON.parse(this.certificateString);
      this._verificationState.certificate = certificate;
    } catch (e) {
      var reason = "Certificate wasn't valid JSON data.";
      return _failed(completionCallback, reason, e);
    }

    if (typeof certificate.receipt === "undefined") {
      this._verificationState.certificateVersion = "1.1";
    } else {
      this._verificationState.certificateVersion = "1.2";
    }

    this._computeLocalHash(completionCallback);
  }

  _computeLocalHash(completionCallback) {
    this.statusCallback(Status.computingLocalHash);

    if (this._verificationState.certificateVersion === "1.1") {
      // When getting the file over HTTP, we've seen an extra newline be appended. This removes that.
      var correctedData = this.certificateString.slice(0, -1);
      this._verificationState.localHash = sha256(correctedData);
      this._fetchRemoteHash();
    } else {
      jsonld.normalize(this._verificationState.certificate.document, {
        algorithm: 'URDNA2015',
        format: 'application/nquads'
      }, (err, normalized) => {
        if (!!err) {
          var reason = "Failed JSON-LD normalization";
          return _failed(completionCallback, reason, err);
        } else {
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
      const receipt = this._verificationState.certificate.receipt;
      transactionID = receipt.anchors[0].sourceId;
    } catch (e) {
      var reason = "Can't verify this certificate without a transaction ID to compare against.";
      return _failed(completionCallback, reason, e);
    }

    var request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      var status = request.status;
      if (status != 200) {
        var reason = "Got unexpected response when trying to get remote transaction data; " + status;
        return _failed(completionCallback, reason, e);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        var outputs = responseData.out;
        var lastOutput = outputs[outputs.length - 1];
        const opReturnScript = lastOutput.script;
        const revokedAddresses = outputs
          .filter((output) => !!output.spent)
          .map((output) => output.addr);

        if (lastOutput.value != 0) {
          var reason = "No transaction output values were 0. This is where the merkle root would be stored.";
          return _failed(completionCallback, reason, e);
        }

        this._verificationState.remoteHash = opReturnScript;
        this._verificationState.revokedAddresses = revokedAddresses;
      } catch (e) {
        var reason = "Unable to parse JSON out of remote transaction data.";
        return _failed(completionCallback, reason, e);
      }

      this._compareHashes(completionCallback);
    });

    var url = "https://blockchain.info/rawtx/" + transactionID + "?cors=true";
    request.open('GET', url);
    request.responseType = "json";
    request.send();
  }

  _compareHashes(completionCallback) {
    this.statusCallback(Status.comparingHashes);
    var compareToHash = "";

    if (this._verificationState.certificateVersion === "1.1") {
      const prefix = "6a20";
      var remoteHash = this._verificationState.remoteHash;
      if (remoteHash.startsWith(prefix)) {
        remoteHash = remoteHash.slice(prefix.length);
      }
      compareToHash = remoteHash
    } else {
      compareToHash = this._verificationState.certificate.receipt.targetHash;
    }

    if (this._verificationState.localHash !== compareToHash) {
      var reason = "Local hash does not match remote hash";
      return _failed(completionCallback, reason, null);
    }

    if (this._verificationState.certificateVersion === "1.1") {
      this._checkIssuerSignature(completionCallback);
    } else {
      this._checkMerkleRoot(completionCallback);
    }
  }

  _checkMerkleRoot(completionCallback) {
    this.statusCallback(Status.checkingMerkleRoot);

    var merkleRoot = this._verificationState.certificate.receipt.merkleRoot;
    var prefixedMerkleRoot = `6a20${merkleRoot}`;

    const remoteHash = this._verificationState.remoteHash;
    if (prefixedMerkleRoot !== remoteHash) {
      var reason = "Merkle root does not match remote hash.";
      return _failed(completionCallback, reason, null);
    }
    this._checkReceipt(completionCallback);
  }

  _checkReceipt(completionCallback) {
    this.statusCallback(Status.checkingReceipt);

    const receipt = this._verificationState.certificate.receipt;
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
      return _failed(completionCallback, reason, e);
    }

    if (proofHash !== merkleRoot) {
      var reason = "Invalid Merkle Receipt. Proof hash didn't match Merkle root";
      return _failed(completionCallback, reason, null);
    }

    this._checkIssuerSignature(completionCallback);
  }

  _checkIssuerSignature(completionCallback) {
    this.statusCallback(Status.checkingIssuerSignature);

    var certificate = this._verificationState.certificate.certificate || this._verificationState.certificate.document.certificate;
    var issuer = certificate && certificate.issuer;
    var issuerURL = issuer.id;
    var request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        var reason = "Got unexpected response when trying to get remote transaction data; " + request.status;
        return _failed(completionCallback, reason, null);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        const issuerKeys = responseData.issuerKeys || [];
        const revocationKeys = responseData.revocationKeys || [];

        var issuerKey = issuerKeys[0].key;
        var revokeKey = revocationKeys[0].key;

        this._verificationState.revocationKey = revokeKey;

        var uid = this._verificationState.certificate.document.assertion.uid;
        var signature = this._verificationState.certificate.document.signature;
        if (!bitcoin.message.verify(issuerKey, signature, uid)) {
          // TODO: `Issuer key doesn't match derived address. Address: ${address}, Issuer Key: ${issuerKey}`
          var reason = "Issuer key doesn't match derived address.";
          return _failed(completionCallback, reason, null);

        }
      } catch (e) {
        var reason = "Unable to parse JSON out of issuer signature data.";
        return _failed(completionCallback, reason, e);
      }

      this._checkRevokedStatus(completionCallback);
    });
    request.addEventListener('error', () => {
      return _failed(completionCallback, "Error requesting issuer signature.", null);
    });
    request.open('GET', issuerURL);
    request.send();
  }

  _checkRevokedStatus(completionCallback) {
    this.statusCallback(Status.checkingRevokedStatus);

    const revokedAddresses = this._verificationState.revokedAddresses;
    var revocationKey = this._verificationState.revocationKey;
    const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((address) => address === revocationKey));
    if (isRevokedByIssuer) {
      var reason = "This certificate batch has been revoked by the issuer.";
      return _failed(completionCallback, reason, e);
    }

    revocationKey = this._verificationState.certificate.document.recipient.revocationKey;
    const isRevokedByRecipient = (-1 != revokedAddresses.findIndex((address) => address === revocationKey));
    if (isRevokedByRecipient) {
      var reason = "This recipient's certificate has been revoked.";
      return this._failed(completionCallback, reason, e);
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

module.exports = CertificateVerifier;


/*
var fs = require('fs');

function statusCallback(arg1) {
  console.log("status=" + arg1);
}

fs.readFile('../tests/sample_signed_cert-valid-1.2.0.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }
  var certVerifier = new CertificateVerifier(data, statusCallback);

  certVerifier.verify(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("done");

    }
  });

});
*/