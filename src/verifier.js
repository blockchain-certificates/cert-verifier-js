import { SUB_STEPS, VERIFICATION_STATUSES } from './constants';
import * as checks from './checks';
import * as blockchainConnectors from './blockchainConnectors';
import debug from 'debug';
import CERTIFICATE_VERSIONS from './constants/certificateVersions';
import VerifierError from './models/verifierError';
import domain from './domain';

const log = debug('Verifier');

export default class Verifier {
  constructor ({ certificateJson, chain, expires, id, issuer, receipt, revocationKey, transactionId, version }) {
    this.chain = chain;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.receipt = receipt;
    this.revocationKey = revocationKey;
    this.version = version;
    this.transactionId = transactionId;

    let document = certificateJson.document;
    if (!document) {
      const certificateCopy = Object.assign({}, certificateJson);
      delete certificateCopy['signature'];
      document = certificateCopy;
    }

    this.documentToVerify = Object.assign({}, document);

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
  }

  /**
   * verify
   */
  async verify (stepCallback = () => {}) {
    this._stepCallback = stepCallback;

    if (this.version === CERTIFICATE_VERSIONS.V1_1) {
      throw new VerifierError(
        '',
        'Verification of 1.1 certificates is not supported by this component. See the python cert-verifier for legacy verification'
      );
    }

    if (this.version === CERTIFICATE_VERSIONS.V1_2) {
      await this._verifyV12();
    } else if (domain.chains.isTestChain(this.chain)) {
      await this._verifyV2Mock();
    } else {
      await this._verifyV2();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === VERIFICATION_STATUSES.FAILURE);
    if (erroredStep) {
      return this._failed({
        status: VERIFICATION_STATUSES.FINAL,
        errorMessage: erroredStep.message
      });
    } else {
      return this._succeed();
    }
  }

  /**
   * doAction
   *
   * @param step
   * @param action
   * @returns {*}
   */
  _doAction (step, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let label;
    if (step) {
      label = SUB_STEPS.language[step].labelPending;
      log(label);
      this._updateStatusCallback(step, label, VERIFICATION_STATUSES.STARTING);
    }

    try {
      let res = action();
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.SUCCESS);
        this._stepsStatuses.push({step, label, status: VERIFICATION_STATUSES.SUCCESS});
      }
      return res;
    } catch (err) {
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.FAILURE, err.message);
        this._stepsStatuses.push({
          code: step,
          label,
          status: VERIFICATION_STATUSES.FAILURE,
          errorMessage: err.message
        });
      }
    }
  }

  /**
   * doAsyncAction
   *
   * @param step
   * @param action
   * @returns {Promise<*>}
   */
  async _doAsyncAction (step, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let label;
    if (step) {
      label = SUB_STEPS.language[step].labelPending;
      log(label);
      this._updateStatusCallback(step, label, VERIFICATION_STATUSES.STARTING);
    }

    try {
      let res = await action();
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.SUCCESS);
        this._stepsStatuses.push({step, label, status: VERIFICATION_STATUSES.SUCCESS});
      }
      return res;
    } catch (err) {
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.FAILURE, err.message);
        this._stepsStatuses.push({
          code: step,
          label,
          status: VERIFICATION_STATUSES.FAILURE,
          errorMessage: err.message
        });
      }
    }
  }

  /**
   * verifyV1_2
   *
   * Verified certificate v1.2
   *
   * @returns {Promise<void>}
   */
  async _verifyV12 () {
    // Check transaction id validity
    this._doAction(
      SUB_STEPS.getTransactionId,
      () => checks.isTransactionIdValid(this.transactionId)
    );

    // Compute local hash
    let localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () => checks.computeLocalHash(this.documentToVerify, this.version)
    );

    // Fetch remote hash
    let txData = await this._doAsyncAction(
      SUB_STEPS.fetchRemoteHash,
      async () => blockchainConnectors.lookForTx(this.transactionId, this.chain.code, this.version)
    );

    // Get issuer profile
    let issuerProfileJson = await this._doAsyncAction(
      SUB_STEPS.getIssuerProfile,
      async () => domain.verifier.getIssuerProfile(this.issuer.id)
    );

    // Parse issuer keys
    let issuerKeyMap = await this._doAsyncAction(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(issuerProfileJson)
    );

    // Compare hashes
    this._doAction(SUB_STEPS.compareHashes, () => {
      checks.ensureHashesEqual(localHash, this.receipt.targetHash);
    });

    // Check merkle root
    this._doAction(SUB_STEPS.checkMerkleRoot, () =>
      checks.ensureMerkleRootEqual(this.receipt.merkleRoot, txData.remoteHash)
    );

    // Check receipt
    this._doAction(SUB_STEPS.checkReceipt, () =>
      checks.ensureValidReceipt(this.receipt)
    );

    // Check revoke status
    this._doAction(SUB_STEPS.checkRevokedStatus, () =>
      checks.ensureNotRevokedBySpentOutput(
        txData.revokedAddresses,
        domain.verifier.parseRevocationKey(issuerProfileJson),
        this.revocationKey
      )
    );

    // Check authenticity
    this._doAction(SUB_STEPS.checkAuthenticity, () =>
      checks.ensureValidIssuingKey(issuerKeyMap, txData.issuingAddress, txData.time)
    );

    // Check expiration
    this._doAction(SUB_STEPS.checkExpiresDate, () =>
      checks.ensureNotExpired(this.expires)
    );
  }

  /**
   * verifyV2
   *
   * Verified certificate v2
   *
   * @returns {Promise<void>}
   */
  async _verifyV2 () {
    // Check transaction id validity
    this._doAction(
      SUB_STEPS.getTransactionId,
      () => checks.isTransactionIdValid(this.transactionId)
    );

    // Compute local hash
    let localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () => checks.computeLocalHash(this.documentToVerify, this.version)
    );

    // Fetch remote hash
    let txData = await this._doAsyncAction(
      SUB_STEPS.fetchRemoteHash,
      async () => blockchainConnectors.lookForTx(this.transactionId, this.chain.code)
    );

    // Get issuer profile
    let issuerProfileJson = await this._doAsyncAction(
      SUB_STEPS.getIssuerProfile,
      async () => domain.verifier.getIssuerProfile(this.issuer.id)
    );

    // Parse issuer keys
    let issuerKeyMap = await this._doAsyncAction(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(issuerProfileJson)
    );

    // Get revoked assertions
    let revokedAssertions = await this._doAsyncAction(
      null,
      async () => domain.verifier.getRevokedAssertions(this.issuer.revocationList)
    );

    // Compare hashes
    this._doAction(SUB_STEPS.compareHashes, () =>
      checks.ensureHashesEqual(localHash, this.receipt.targetHash)
    );

    // Check merkle root
    this._doAction(SUB_STEPS.checkMerkleRoot, () =>
      checks.ensureMerkleRootEqual(this.receipt.merkleRoot, txData.remoteHash)
    );

    // Check receipt
    this._doAction(SUB_STEPS.checkReceipt, () =>
      checks.ensureValidReceipt(this.receipt)
    );

    // Check revoked status
    this._doAction(SUB_STEPS.checkRevokedStatus, () =>
      checks.ensureNotRevokedByList(revokedAssertions, this.id)
    );

    // Check authenticity
    this._doAction(SUB_STEPS.checkAuthenticity, () =>
      checks.ensureValidIssuingKey(issuerKeyMap, txData.issuingAddress, txData.time)
    );

    // Check expiration date
    this._doAction(SUB_STEPS.checkExpiresDate, () =>
      checks.ensureNotExpired(this.expires)
    );
  }

  /**
   * verifyV2Mock
   *
   * Verify a v2 mock certificate
   *
   * @returns {Promise<void>}
   */
  async _verifyV2Mock () {
    // Compute local hash
    let localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () =>
        checks.computeLocalHash(this.documentToVerify, this.version)
    );

    // Compare hashes
    this._doAction(SUB_STEPS.compareHashes, () =>
      checks.ensureHashesEqual(localHash, this.receipt.targetHash)
    );

    // Check receipt
    this._doAction(SUB_STEPS.checkReceipt, () =>
      checks.ensureValidReceipt(this.receipt)
    );

    // Check expiration date
    this._doAction(SUB_STEPS.checkExpiresDate, () =>
      checks.ensureNotExpired(this.expires)
    );
  }

  /**
   * _failed
   *
   * @param stepCode
   * @param errorMessage
   * @returns {{code: string, status: string, errorMessage: string}}
   * @private
   */
  _failed ({step, errorMessage}) {
    log(`failure:${errorMessage}`);
    return {code: step, status: VERIFICATION_STATUSES.FAILURE, errorMessage};
  }

  /**
   * _isFailing
   *
   * whether or not the current verification is failing
   *
   * @returns {boolean}
   * @private
   */
  _isFailing () {
    return this._stepsStatuses.some(step => step.status === VERIFICATION_STATUSES.FAILURE);
  }

  /**
   * _succeed
   */
  _succeed () {
    let status;
    if (domain.chains.isTestChain(this.chain)) {
      log(
        'This mock Blockcert passed all checks. Mocknet mode is only used for issuers to test their workflow locally. This Blockcert was not recorded on a blockchain, and it should not be considered a verified Blockcert.'
      );
      status = VERIFICATION_STATUSES.MOCK_SUCCESS;
    } else {
      log('success');
      status = VERIFICATION_STATUSES.SUCCESS;
    }

    return {status};
  }

  /**
   * _updateStatusCallback
   *
   * calls the origin callback to update on a step status
   *
   * @param code
   * @param label
   * @param status
   * @param errorMessage
   * @private
   */
  _updateStatusCallback (code, label, status, errorMessage = '') {
    if (code != null) {
      let update = {code, label, status};
      if (errorMessage) {
        update.errorMessage = errorMessage;
      }
      this._stepCallback(update);
    }
  }
}
