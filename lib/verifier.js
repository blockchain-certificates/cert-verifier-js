'use strict';

import debug from 'debug';
import { Certificate } from './certificate';
import {
  Blockchain,
  Status,
  CertificateVersion,
  getVerboseMessage,
  VerifierError,
} from '../config/default';
import * as checks from './checks';
import * as blockchainConnectors from './blockchainConnectors';
import {
  parseIssuerKeys,
  parseRevocationKey,
  getIssuerKeys,
  getIssuerProfile,
  getRevokedAssertions,
} from './verifierModels';

const log = debug('verifier');

var noop = function() {};

export class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    const certificateJson = JSON.parse(certificateString);
    this.certificate = Certificate.parseJson(certificateJson);
    let document = certificateJson.document;
    if (!document) {
      var certCopy = JSON.parse(certificateString);
      delete certCopy['signature'];
      document = certCopy;
    }
    this.document = document;
    this.statusCallback = statusCallback || noop;
    this.completionCallback = null;
    
    // v1.1 only
    this.certificateString = certificateString;

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
  }

  /**
   * _updateCallback
   * 
   * calls the origin callback to update on a step status
   * 
   * @param {*} stepCode 
   * @param {*} message 
   * @param {*} status 
   */
  _updateCallback(stepCode, message, status) {
    if (stepCode != null) {
      this.statusCallback(stepCode, message, status);
    }
  }

  /**
   * _succeed
   * 
   * @param {*} completionCallback 
   */
  _succeed(completionCallback) {
    let status;
    if (
      this.certificate.chain === Blockchain.mocknet ||
      this.certificate.chain === Blockchain.regtest
    ) {
      log(
        'This mock Blockcert passed all checks. Mocknet mode is only used for issuers to test their workflow locally. This Blockcert was not recorded on a blockchain, and it should not be considered a verified Blockcert.',
      );
      status = Status.mockSuccess;
    } else {
      log('success');
      status = Status.success;
    }
  
    this.completionCallback(Status.final, '', status);
    return status;
  }

  /**
   * _failed
   * 
   * @param {*} stepCode 
   * @param {*} completionCallback 
   * @param {*} err 
   */
  _failed(stepCode, message) {
    stepCode = stepCode || '';
    message = message || '';
    log(`failure:${message}`);
    
    this.completionCallback(stepCode, message, Status.failure);
    return Status.failure;
  }

  /**
   * _isFailing
   *
   * whether or not the current verification is failing
   *
   * @returns {boolean}
   * @private
   */
  _isFailing() {
    return this._stepsStatuses.length > 0 && this._stepsStatuses.indexOf(Status.failure) > -1;
  }

  /**
   * doAction
   *
   * @param stepCode
   * @param action
   * @returns {*}
   */
  doAction(stepCode, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

	  let stepName = getVerboseMessage(stepCode);
    log(stepName);
    this._updateCallback(stepCode, stepName, Status.starting);

    try {
      let res = action();
      this._updateCallback(stepCode, stepName, Status.success);
      this._stepsStatuses.push(Status.success);
      return res;
    } catch(err) {
      this._updateCallback(stepCode, stepName, Status.failure, err.message);
      this._stepsStatuses.push(Status.failure);
    }
  }

  /**
   * doAsyncAction
   *
   * @param stepCode
   * @param action
   * @returns {Promise<*>}
   */
  async doAsyncAction(stepCode, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let message;
    if (stepCode != null) {
      message = getVerboseMessage(stepCode);
      log(message);
      this._updateCallback(stepCode, message, Status.starting);
    }

    try {
      let res = await action();
      this._updateCallback(stepCode, message, Status.success);
      this._stepsStatuses.push(Status.success);
      return res;
    } catch(err) {
      this._updateCallback(stepCode, err.message, Status.failure);
      this._stepsStatuses.push(Status.failure);
    }
  }

  /**
   * verifyV1_2
   *
   * Verified certificate v1.2
   *
   * @returns {Promise<void>}
   */
  async verifyV1_2() {
    // Get transaction
    let transactionId = this.doAction(
      Status.getTransactionId,
      () => checks.getTransactionId(this.certificate)
    );

    let docToVerify = this.document;

    // Compute local hash
    let localHash = await this.doAsyncAction(
      Status.computingLocalHash,
      async () =>
        checks.computeLocalHash(docToVerify, this.certificate.version),
    );

    // Get remote hash
    let txData = await this.doAsyncAction(Status.fetchingRemoteHash, async () =>
      blockchainConnectors.lookForTx(
        transactionId,
        this.certificate.chain,
        this.certificate.version,
      ),
    );

    // Get issuer profile
    let issuerProfileJson = await this.doAsyncAction(
      Status.gettingIssuerProfile,
      async () => getIssuerProfile(this.certificate.issuer.id),
    );

    // Parse issuer keys
    let issuerKeyMap = await this.doAsyncAction(
      Status.parsingIssuerKeys,
      () => parseIssuerKeys(issuerProfileJson),
    );

    // Compare hashes
    this.doAction(Status.comparingHashes, () => {
        checks.ensureHashesEqual(localHash, this.certificate.receipt.targetHash)
      }
    );

    // Check merkle root
    this.doAction(Status.checkingMerkleRoot, () =>
      checks.ensureMerkleRootEqual(
        this.certificate.receipt.merkleRoot,
        txData.remoteHash,
      ),
    );

    // Check receipt
    this.doAction(Status.checkingReceipt, () =>
      checks.ensureValidReceipt(this.certificate.receipt),
    );

    // Check revoke status
    this.doAction(Status.checkingRevokedStatus, () =>
      checks.ensureNotRevokedBySpentOutput(
        txData.revokedAddresses,
        parseRevocationKey(issuerProfileJson),
        this.certificate.revocationKey,
      ),
    );

    // Check authenticity
    this.doAction(Status.checkingAuthenticity, () =>
      checks.ensureValidIssuingKey(
        issuerKeyMap,
        txData.issuingAddress,
        txData.time,
      ),
    );

    // Check expiration
    this.doAction(Status.checkingExpiresDate, () =>
      checks.ensureNotExpired(this.certificate.expires),
    );
  }

  /**
   * verifyV2
   *
   * Verified certificate v2
   *
   * @returns {Promise<void>}
   */
  async verifyV2() {
    // Get transaction
    let transactionId = this.doAction(
      Status.getTransactionId,
      () => checks.getTransactionId(this.certificate)
    );
    
    let docToVerify = this.document;

    // Compute local hash
    let localHash = await this.doAsyncAction(
      Status.computingLocalHash,
      async () =>
        checks.computeLocalHash(docToVerify, this.certificate.version),
    );

    // Fetch remote hash
    let txData = await this.doAsyncAction(
      Status.fetchingRemoteHash,
      async () => {
        return blockchainConnectors.lookForTx(transactionId, this.certificate.chain);
      }
    );

    // Get issuer keys
    let issuerKeyMap = await this.doAsyncAction(
      Status.parsingIssuerKeys,
      async () => {
        return getIssuerKeys(this.certificate.issuer.id);
      }
    );

    // Get issuer keys
    let revokedAssertions = await this.doAsyncAction(
      null,
      async () => {
        return getRevokedAssertions(this.certificate.issuer.revocationList);
      }
    );

    // Compare hashes
    this.doAction(Status.comparingHashes, () =>
      checks.ensureHashesEqual(localHash, this.certificate.receipt.targetHash),
    );

    // Check merkle root
    this.doAction(Status.checkingMerkleRoot, () =>
      checks.ensureMerkleRootEqual(
        this.certificate.receipt.merkleRoot,
        txData.remoteHash,
      ),
    );

    // Check receipt
    this.doAction(Status.checkingReceipt, () =>
      checks.ensureValidReceipt(this.certificate.receipt),
    );

    // Check revoked status
    this.doAction(Status.checkingRevokedStatus, () =>
      checks.ensureNotRevokedByList(revokedAssertions, this.certificate.id),
    );

    // Check authenticity
    this.doAction(Status.checkingAuthenticity, () =>
      checks.ensureValidIssuingKey(
        issuerKeyMap,
        txData.issuingAddress,
        txData.time,
      ),
    );

    // Check expiration date
    this.doAction(Status.checkingExpiresDate, () =>
      checks.ensureNotExpired(this.certificate.expires),
    );
  }

  /**
   * verifyV2Mock
   *
   * Verify a v2 mock certificate
   *
   * @returns {Promise<void>}
   */
  async verifyV2Mock() {
    let docToVerify = this.document;
    // Compute local hash
    let localHash = await this.doAsyncAction(
      Status.computingLocalHash,
      async () =>
        checks.computeLocalHash(docToVerify, this.certificate.version),
    );

    // Compare hashes
    this.doAction(Status.comparingHashes, () =>
      checks.ensureHashesEqual(localHash, this.certificate.receipt.targetHash),
    );

    // Check receipt
    this.doAction(Status.checkingReceipt, () =>
      checks.ensureValidReceipt(this.certificate.receipt),
    );

    // Check expiration date
    this.doAction(Status.checkingExpiresDate, () =>
      checks.ensureNotExpired(this.certificate.expires),
    );
  }

  /**
   * verify
   *
   * @param completionCallback
   * @returns {Promise<*>}
   */
  async verify(completionCallback) {
    if (this.certificate.version === CertificateVersion.v1_1) {
      throw new VerifierError(
        '',
        'Verification of 1.1 certificates is not supported by this component. See the python cert-verifier for legacy verification',
      );
    }

    // Save completion callback
    this.completionCallback = completionCallback || noop;
    try {
      if (this.certificate.version === CertificateVersion.v1_2) {
        await this.verifyV1_2();
      } else if (
        this.certificate.chain === Blockchain.mocknet ||
        this.certificate.chain === Blockchain.regtest
      ) {
        await this.verifyV2Mock();
      } else {
        await this.verifyV2();
      }

      // Send final callback update for global verification status
      if (this._stepsStatuses.indexOf(Status.failure) > -1) {
        return this._failed(Status.final);
      } else {
        return this._succeed();
      }
    } catch (e) {
      //return this._failed(e.stepCode, e.message);
    }
  }
}

/*
import {readFileAsync} from './promisifiedRequests'

function statusCallback(arg1) {
  console.log(`callback status: ${arg1}`);
}

async function test() {
  try {
    //var data = await readFileAsync('../tests/data/sample_cert-revoked-2.0.json');
    var data = await readFileAsync('../tests/data/sample_cert-valid-1.2.0.json')
    var certVerifier = new CertificateVerifier(data, statusCallback);
    certVerifier.verify((status, message) => {
      console.log("completion status: " + status);
      if (message) {
        console.error("completion message: " + message);
      }
    }).catch((err) => {console.error("Unexpected error: " + err)})
  } catch (err) {
    console.error('Failed!');
    console.error(err);
  }
}

test();
*/
