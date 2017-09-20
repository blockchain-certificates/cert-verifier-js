'use strict';

import debug from 'debug';
import VError from 'verror';
import {Certificate} from './certificate';
import {Blockchain, Status, CertificateVersion, getVerboseMessage} from '../config/default';
import {readFileAsync} from './promisifiedRequests'
import * as checks from './checks'
import * as bitcoinConnectors from './bitcoinConnectors'
import {parseIssuerKeys, parseRevocationKey, getIssuerKeys, getIssuerProfile, getRevokedAssertions} from './verifierModels';

const log = debug("verifier");

require('string.prototype.startswith');

var noop = function () {
};

export class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    const certificateJson = JSON.parse(certificateString);
    this.certificate = Certificate.parseJson(certificateJson);

    let document = certificateJson.document;
    if (!document) {
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
    if (this.certificate.chain === Blockchain.mocknet) {
      log("This mock Blockcert passed all checks. Mocknet mode is only used for issuers to test their workflow locally. This Blockcert was not recorded on a blockchain, and it should not be considered a verified Blockcert.");
      this.statusCallback(Status.mockSuccess);
      return Status.mockSuccess
    } else {
      log("success");
      this.statusCallback(Status.success);
      return Status.success
    }
  }

  _failed(completionCallback, err) {
    log(`failure:${err.message}`);
    this.statusCallback(Status.failure, err.message);
    throw err;
  }

  doAction(status, action) {
    log(getVerboseMessage(status));
    this.statusCallback(status);
    return action();
  }

  async doAsyncAction(status, action) {
    log(getVerboseMessage(status));
    this.statusCallback(status);
    return await action();
  }

  getTransactionId() {
    let transactionId;
    try {
      transactionId = this.certificate.receipt.anchors[0].sourceId;
      return transactionId
    } catch (e) {
      throw new VError("Can't verify this certificate without a transaction ID to compare against.");
    }
  }

  async verifyV1_2() {
    let transactionId = this.getTransactionId();
    let docToVerify = this.document;

    let localHash = await this.doAsyncAction(
        Status.computingLocalHash,
        async () => checks.computeLocalHash(docToVerify, this.certificate.version));
    let [txData, issuerProfileJson] = await Promise.all(
          [
            bitcoinConnectors.lookForTx(transactionId, this.certificate.chain, this.certificate.version),
            getIssuerProfile(this.certificate.issuer.id)
          ]);
    let issuerKeyMap = parseIssuerKeys(issuerProfileJson);

    this.doAction(Status.comparingHashes,
        () => checks.ensureHashesEqual(localHash, this.certificate.receipt.targetHash));
    this.doAction(Status.checkingMerkleRoot,
          () => checks.ensureMerkleRootEqual(this.certificate.receipt.merkleRoot, txData.remoteHash));
    this.doAction(Status.checkingReceipt,
        () => checks.ensureValidReceipt(this.certificate.receipt));
    this.doAction(Status.checkingRevokedStatus,
          () => checks.ensureNotRevokedBySpentOutput(txData.revokedAddresses, parseRevocationKey(issuerProfileJson), this.certificate.revocationKey));
    this.doAction(Status.checkingAuthenticity,
          () => checks.ensureValidIssuingKey(issuerKeyMap, txData.issuingAddress, txData.time));
    this.doAction(Status.checkingExpiresDate,
        () => checks.ensureNotExpired(this.certificate.expires));
  }

  async verifyV2() {
    let transactionId = this.getTransactionId();
    let docToVerify = this.document;

      let localHash = await this.doAsyncAction(
          Status.computingLocalHash,
          async () => checks.computeLocalHash(docToVerify, this.certificate.version));
      let [txData, issuerKeyMap, revokedAssertions] = await Promise.all(
            [
              bitcoinConnectors.lookForTx(transactionId, this.certificate.chain),
              getIssuerKeys(this.certificate.issuer.id),
              getRevokedAssertions(this.certificate.issuer.revocationList)
            ]);

      this.doAction(Status.comparingHashes,
          () => checks.ensureHashesEqual(localHash, this.certificate.receipt.targetHash));
      this.doAction(Status.checkingMerkleRoot,
            () => checks.ensureMerkleRootEqual(this.certificate.receipt.merkleRoot, txData.remoteHash));
      this.doAction(Status.checkingReceipt,
          () => checks.ensureValidReceipt(this.certificate.receipt));
      this.doAction(Status.checkingRevokedStatus,
            () => checks.ensureNotRevokedByList(revokedAssertions, this.certificate.id));
      this.doAction(Status.checkingAuthenticity,
            () => checks.ensureValidIssuingKey(issuerKeyMap, txData.issuingAddress, txData.time));
      this.doAction(Status.checkingExpiresDate,
          () => checks.ensureNotExpired(this.certificate.expires));
  }

  async verifyV2Mock() {
    let docToVerify = this.document;
    let localHash = await this.doAsyncAction(
        Status.computingLocalHash,
        async () => checks.computeLocalHash(docToVerify, this.certificate.version));

    this.doAction(Status.comparingHashes,
        () => checks.ensureHashesEqual(localHash, this.certificate.receipt.targetHash));
    this.doAction(Status.checkingReceipt,
        () => checks.ensureValidReceipt(this.certificate.receipt));
    this.doAction(Status.checkingExpiresDate,
        () => checks.ensureNotExpired(this.certificate.expires));
  }

  async verify(completionCallback) {
    if (this.certificate.version == CertificateVersion.v1_1) {
      throw new VError("Verification of 1.1 certificates is not supported by this component. See the python cert-verifier for legacy verification");
    }
    completionCallback = completionCallback || noop;
    try {
      if (this.certificate.version == CertificateVersion.v1_2) {
        await this.verifyV1_2();
      } else if (this.certificate.chain == Blockchain.mocknet) {
        await this.verifyV2Mock();
      } else {
        await this.verifyV2();
      }

      return this._succeed(completionCallback);
    } catch (e) {
      return this._failed(completionCallback, e);
    }
  }
}


function statusCallback(arg1) {
  console.log(`status: ${arg1}`);
}

async function test() {
  try {
    var data = await readFileAsync('../tests/data/sample_cert-valid-2.0.json');
    //var data = await readFileAsync('../tests/data/sample_cert-valid-1.2.0.json');
    var certVerifier = new CertificateVerifier(data, statusCallback);
    certVerifier.verify().then(x => console.log(`final result: ${x}`)).catch(e => console.error(`failed: ${e}`));
  } catch (err) {
    console.error('Failed!');
    console.error(err);
  }
}

test();


