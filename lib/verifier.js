'use strict';

var jsonld = require('jsonld');
var sha256 = require('sha256');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bitcoin = require('bitcoinjs-lib');
const VError = require('verror');


let Status = {
  computingLocalHash: "computingLocalHash",
  fetchingRemoteHash: "fetchingRemoteHash",
  comparingHashes: "comparingHashes",
  checkingMerkleRoot: "checkingMerkleRoot",
  checkingReceipt: "checkingReceipt",
  checkingIssuerSignature: "checkingIssuerSignature",
  checkingRevokedStatus: "checkingRevokedStatus",
  success: "success",
  failure: "failure",
};

var noop = function(){};

class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    this.certificateString = certificateString;
    this.statusCallback = statusCallback || noop;
  }

  verify(callback) {
    callback = callback || noop;
    this._verificationState = {};
    let certificate;
    try {
      certificate = JSON.parse(this.certificateString);
      this._verificationState.certificate = certificate;
    } catch (e) {
      let e2 = new VError(e, "Certificate wasn't valid JSON data.");
      return callback(e2);
    }

    if (typeof certificate.receipt === "undefined") {
      this._verificationState.certificateVersion = "1.1";
    } else {
      this._verificationState.certificateVersion = "1.2";
    }

    this._computeLocalHash(callback);
  }

  _computeLocalHash(callback) {
    this.statusCallback(Status.computingLocalHash);

    if (this._verificationState.certificateVersion === "1.1") {
      // When getting the file over HTTP, we've seen an extra newline be appended. This removes that.
      let correctedData = this.certificateString.slice(0, -1);
      this._verificationState.localHash = sha256(correctedData);
      this._fetchRemoteHash();
    } else {
      jsonld.normalize(this._verificationState.certificate.document, {
        algorithm: 'URDNA2015',
        format: 'application/nquads'
      }, (err, normalized) => {
        if (!!err) {
          let e2 = new VError(err, "Failed JSON-LD normalization");
          return callback(e2);
        } else {
          this._verificationState.localHash = sha256(this._toUTF8Data(normalized));
          this._fetchRemoteHash(callback);
        }
      });
    }
  }

  _fetchRemoteHash(callback) {
    this.statusCallback(Status.fetchingRemoteHash);

    let transactionID;
    try {
      const receipt = this._verificationState.certificate.receipt;
      transactionID = receipt.anchors[0].sourceId;
    } catch (e) {
      let e2 = new VError(e, "Can't verify this certificate without a transaction ID to compare against.");
      return callback(e2);
    }

    let request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      var status = request.status;
      if (status != 200) {
        let e = new VError("Got unexpected response when trying to get remote transaction data; " + status);
        return callback(e);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        let outputs = responseData.out;
        let lastOutput = outputs[outputs.length - 1];
        const opReturnScript = lastOutput.script;
        const revokedAddresses = outputs
          .filter((output) => !!output.spent)
          .map((output) => output.addr);

        if (lastOutput.value != 0) {
          let e = new VError("No transaction output values were 0. This is where the merkle root would be stored.");
          return callback(e);
        }

        this._verificationState.remoteHash = opReturnScript;
        this._verificationState.revokedAddresses = revokedAddresses;
      } catch (e) {
        let e2 = new VError("Unable to parse JSON out of remote transaction data.");
        return callback(e2);
      }

      this._compareHashes(callback);
    });

    var url = "https://blockchain.info/rawtx/" + transactionID + "?cors=true";
    request.open('GET', url);
    request.responseType = "json";
    request.send();
  }

  _compareHashes(callback) {
    this.statusCallback(Status.comparingHashes);
    let compareToHash = "";

    if (this._verificationState.certificateVersion === "1.1") {
      const prefix = "6a20";
      let remoteHash = this._verificationState.remoteHash;
      if (remoteHash.startsWith(prefix)) {
        remoteHash = remoteHash.slice(prefix.length);
      }
      compareToHash = remoteHash
    } else {
      compareToHash = this._verificationState.certificate.receipt.targetHash;
    }

    if (this._verificationState.localHash !== compareToHash) {
      let e = new VError("Local hash does not match remote hash");
      return callback(e);
    }

    if (this._verificationState.certificateVersion === "1.1") {
      this._checkIssuerSignature(callback);
    } else {
      this._checkMerkleRoot(callback);
    }
  }

  _checkMerkleRoot(callback) {
    this.statusCallback(Status.checkingMerkleRoot);

    let merkleRoot = this._verificationState.certificate.receipt.merkleRoot;
    let prefixedMerkleRoot = `6a20${merkleRoot}`;

    const remoteHash = this._verificationState.remoteHash;
    if (prefixedMerkleRoot !== remoteHash) {
      let e = new VError("Merkle root does not match remote hash.");
      return callback(e);
    }
    this._checkReceipt(callback);
  }

  _checkReceipt(callback) {
    this.statusCallback(Status.checkingReceipt);

    const receipt = this._verificationState.certificate.receipt;
    let proofHash = receipt.targetHash;
    let merkleRoot = receipt.merkleRoot;
    try {
      let proof = receipt.proof;
      if (!!proof) {
        for (let index in proof) {
          const node = proof[index];
          if (typeof node.left !== "undefined") {
            let appendedBuffer = this._toByteArray(`${node.left}${proofHash}`);
            proofHash = sha256(appendedBuffer);
          } else if (typeof node.right !== "undefined") {
            let appendedBuffer = this._toByteArray(`${proofHash}${node.right}`);
            proofHash = sha256(appendedBuffer);
          } else {
            throw new Error("We should never get here.");
          }
        }
      }
    } catch (e) {
      let e2 = new VError("The receipt is malformed. There was a problem navigating the merkle tree in the receipt.");
      return callback(e2);
    }

    if (proofHash !== merkleRoot) {
      let e = new VError("Invalid Merkle Receipt. Proof hash didn't match Merkle root");
      return callback(e);

    }

    this._checkIssuerSignature(callback);
  }

  _checkIssuerSignature(callback) {
    this.statusCallback(Status.checkingIssuerSignature);

    let certificate = this._verificationState.certificate.certificate || this._verificationState.certificate.document.certificate;
    let issuer = certificate && certificate.issuer;
    let issuerURL = issuer.id;
    let request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      if (request.status !== 200) {
        let e = new VError("Got unexpected response when trying to get remote transaction data; " + request.status);
        return callback(e);
      }
      try {
        const responseData = JSON.parse(request.responseText);
        const issuerKeys = responseData.issuerKeys || [];
        const revocationKeys = responseData.revocationKeys || [];

        let issuerKey = issuerKeys[0].key;
        let revokeKey = revocationKeys[0].key;

        this._verificationState.revocationKey = revokeKey;

        let uid = this._verificationState.certificate.document.assertion.uid;
        let signature = this._verificationState.certificate.document.signature;
        if (!bitcoin.message.verify(issuerKey, signature, uid)) {
          // TODO: `Issuer key doesn't match derived address. Address: ${address}, Issuer Key: ${issuerKey}`
          let e = new VError("Issuer key doesn't match derived address.");
          return callback(e);

        }
      } catch (e) {
        let e2 = new VError(e, "Unable to parse JSON out of issuer signature data.");
        return callback(e2);
      }

      this._checkRevokedStatus(callback);
    });
    request.addEventListener('error', () => {
      let e = new VError("Error requesting issuer signature.");
      return callback(e);
    });
    request.open('GET', issuerURL);
    request.send();
  }

  _checkRevokedStatus(callback) {
    this.statusCallback(Status.checkingRevokedStatus);

    const revokedAddresses = this._verificationState.revokedAddresses;
    let revocationKey = this._verificationState.revocationKey;
    const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((address) => address === revocationKey));
    if (isRevokedByIssuer) {
      let e = new VError("This certificate batch has been revoked by the issuer.");
      return callback(e);
    }

    revocationKey = this._verificationState.certificate.document.recipient.revocationKey;
    const isRevokedByRecipient = (-1 != revokedAddresses.findIndex((address) => address === revocationKey));
    if (isRevokedByRecipient) {
      let e = new VError("This recipient's certificate has been revoked.");
      return callback(e);
    }

    return callback(null, Status.success);
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
    let outArray = [];
    let byteSize = 2;
    for (let i = 0; i < hexString.length; i += byteSize) {
      outArray.push(parseInt(hexString.substring(i, i + byteSize), 16));
    }
    return outArray;
  }

  _hexFromByteArray(byteArray) {
    let out = "";
    for (let i = 0; i < byteArray.length; ++i) {
      let value = byteArray[i];
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