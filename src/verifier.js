import { STEPS, SUB_STEPS, VERIFICATION_STATUSES } from './constants';
import debug from 'debug';
import CERTIFICATE_VERSIONS from './constants/certificateVersions';
import VerifierError from './models/verifierError';
import domain from './domain';
import * as inspectors from './inspectors';

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
      delete certificateCopy.signature;
      delete certificateCopy.proof;
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

    if (domain.chains.isMockChain(this.chain)) {
      await this._verifyV2Mock();
    } else {
      await this._verifyMain();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === VERIFICATION_STATUSES.FAILURE);
    return erroredStep ? this._failed(erroredStep) : this._succeed();
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
      label = domain.i18n.getText('subSteps', `${step}LabelPending`);
      log(label);
      this._updateStatusCallback(step, label, VERIFICATION_STATUSES.STARTING);
    }

    try {
      const res = action();
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.SUCCESS);
        this._stepsStatuses.push({ step, label, status: VERIFICATION_STATUSES.SUCCESS });
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
      label = domain.i18n.getText('subSteps', `${step}LabelPending`);
      log(label);
      this._updateStatusCallback(step, label, VERIFICATION_STATUSES.STARTING);
    }

    try {
      const res = await action();
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.SUCCESS);
        this._stepsStatuses.push({ step, label, status: VERIFICATION_STATUSES.SUCCESS });
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

  async _verifyMain () {
    // Check transaction id validity
    this._doAction(
      SUB_STEPS.getTransactionId,
      () => inspectors.isTransactionIdValid(this.transactionId)
    );

    // Compute local hash
    const localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () => inspectors.computeLocalHash(this.documentToVerify, this.version)
    );

    // Fetch remote hash
    const txData = await this._doAsyncAction(
      SUB_STEPS.fetchRemoteHash,
      async () => domain.verifier.lookForTx(this.transactionId, this.chain.code, this.version)
    );

    // Get issuer profile
    const issuerProfileJson = await this._doAsyncAction(
      SUB_STEPS.getIssuerProfile,
      async () => domain.verifier.getIssuerProfile(this.issuer)
    );

    // Parse issuer keys
    const issuerKeyMap = await this._doAsyncAction(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(issuerProfileJson)
    );

    // Compare hashes
    this._doAction(SUB_STEPS.compareHashes, () => {
      inspectors.ensureHashesEqual(localHash, this.receipt.targetHash);
    });

    // Check merkle root
    this._doAction(SUB_STEPS.checkMerkleRoot, () =>
      inspectors.ensureMerkleRootEqual(this.receipt.merkleRoot, txData.remoteHash)
    );

    // Check receipt
    this._doAction(SUB_STEPS.checkReceipt, () =>
      inspectors.ensureValidReceipt(this.receipt, this.version)
    );

    // Check revoked status
    let keys;
    let revokedAddresses;
    if (this.version === CERTIFICATE_VERSIONS.V1_2) {
      revokedAddresses = txData.revokedAddresses;
      keys = [
        domain.verifier.parseRevocationKey(issuerProfileJson),
        this.revocationKey
      ];
    } else {
      // Get revoked assertions
      revokedAddresses = await this._doAsyncAction(
        null,
        async () => domain.verifier.getRevokedAssertions(this.issuer.revocationList)
      );
      keys = this.id;
    }

    this._doAction(SUB_STEPS.checkRevokedStatus, () =>
      inspectors.ensureNotRevoked(revokedAddresses, keys)
    );

    // Check authenticity
    this._doAction(SUB_STEPS.checkAuthenticity, () =>
      inspectors.ensureValidIssuingKey(issuerKeyMap, txData.issuingAddress, txData.time)
    );

    // Check expiration
    this._doAction(SUB_STEPS.checkExpiresDate, () =>
      inspectors.ensureNotExpired(this.expires)
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
    const localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () =>
        inspectors.computeLocalHash(this.documentToVerify, this.version)
    );

    // Compare hashes
    this._doAction(SUB_STEPS.compareHashes, () =>
      inspectors.ensureHashesEqual(localHash, this.receipt.targetHash)
    );

    // Check receipt
    this._doAction(SUB_STEPS.checkReceipt, () =>
      inspectors.ensureValidReceipt(this.receipt)
    );

    // Check expiration date
    this._doAction(SUB_STEPS.checkExpiresDate, () =>
      inspectors.ensureNotExpired(this.expires)
    );
  }

  /**
   * _failed
   *
   * Returns a failure final step message
   *
   * @param errorMessage
   * @returns {{code: string, status: string, errorMessage: *}}
   * @private
   */
  _failed (errorStep) {
    const message = errorStep.errorMessage;
    log(`failure:${message}`);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.FAILURE, message });
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
   *
   * Returns a final success message
   */
  _succeed () {
    const message = domain.chains.isMockChain(this.chain)
      ? domain.i18n.getText('success', 'mocknet')
      : domain.i18n.getText('success', 'blockchain');
    log(message);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.SUCCESS, message });
  }

  _setFinalStep ({ status, message }) {
    return { code: STEPS.final, status, message };
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
      const update = { code, label, status };
      if (errorMessage) {
        update.errorMessage = errorMessage;
      }
      this._stepCallback(update);
    }
  }
}
