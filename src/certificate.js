import domain from './domain';
import { BLOCKCHAINS } from './constants/blockchains';
import * as CERTIFICATE_VERSIONS from './constants/certificateVersions';
import { SignatureImage } from './models/index';
import { VerifierError } from './models/verifierError';
import { getVerboseMessage, Status } from '../config/default';
import {
  getIssuerKeys,
  getIssuerProfile,
  getRevokedAssertions,
  parseIssuerKeys,
  parseRevocationKey
} from './verifierModels';
import * as checks from './checks';
import * as blockchainConnectors from './blockchainConnectors';
import debug from 'debug';

const log = debug('Certificate');

export default class Certificate {
  constructor (certificateJson) {
    if (typeof certificateJson !== 'object') {
      try {
        certificateJson = JSON.parse(certificateJson);
      } catch (err) {
        throw new Error('This is not a valid certificate');
      }
    }

    // Keep certificate JSON object
    this.certificateJson = certificateJson;

    // Parse certificate
    this.parseJson(certificateJson);

    // Initialize verification
    this._initVerifier();
  }

  /**
   * parseJson
   *
   * @param certificateJson
   * @returns {*}
   */
  parseJson (certificateJson) {
    const version = certificateJson['@context'];
    this.isFormatValid = version instanceof Array ? this._parseV2(certificateJson) : this._parseV1(certificateJson);
  }

  /**
   * verify
   */
  async verify (stepCallback = () => {}) {
    this._stepCallback = stepCallback;

    if (this.version === CERTIFICATE_VERSIONS.v1dot1) {
      throw new VerifierError(
        '',
        'Verification of 1.1 certificates is not supported by this component. See the python cert-verifier for legacy verification'
      );
    }

    if (this.version === CERTIFICATE_VERSIONS.v1dot2) {
      await this._verifyV1dot2();
    } else if (
      this.chain.code === BLOCKCHAINS.mocknet.code ||
      this.chain.code === BLOCKCHAINS.regtest.code
    ) {
      await this._verifyV2Mock();
    } else {
      await this._verifyV2();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === Status.failure);
    if (erroredStep) {
      return this._failed(Status.final, erroredStep.message);
    } else {
      return this._succeed(Status.final);
    }
  }

  /**
   * _initVerifier
   *
   * @private
   */
  _initVerifier () {
    let document = this.certificateJson.document;
    if (!document) {
      const certificateCopy = Object.assign({}, this.certificateJson);
      delete certificateCopy['signature'];
      document = certificateCopy;
    }
    this.documentToVerify = document;

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
  }

  /**
   * _setProperties
   *
   * @param certificateImage
   * @param chain
   * @param description
   * @param expires
   * @param id
   * @param issuer
   * @param publicKey
   * @param receipt
   * @param recipientFullName
   * @param revocationKey
   * @param sealImage
   * @param signature
   * @param signatureImage
   * @param subtitle
   * @param title
   * @private
   */
  _setProperties ({ certificateImage, chain, description, expires, id, issuer, publicKey, receipt, recipientFullName, revocationKey, sealImage, signature, signatureImage, subtitle, title, version }) {
    this.certificateImage = certificateImage;
    this.chain = chain;
    this.description = description;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.publicKey = publicKey;
    this.receipt = receipt;
    this.recipientFullName = recipientFullName;
    this.revocationKey = revocationKey;
    this.sealImage = sealImage;
    this.signature = signature;
    this.signatureImage = signatureImage;
    this.subtitle = subtitle;
    this.title = title;
    this.version = version;

    // Transaction ID, link & raw link
    this._setTransactionDetails();

    // Get the full verification step-by-step map
    // TODO
    this.verificationSteps = [];
  }

  /**
   * parseV1
   *
   * @param certificateJson
   * @returns {Certificate}
   */
  _parseV1 (certificateJson) {
    this.fullCertificateObject = certificateJson.certificate || certificateJson.document.certificate;
    const recipient = certificateJson.recipient || certificateJson.document.recipient;
    const assertion = certificateJson.document.assertion;

    // NEW
    const receipt = certificateJson.receipt;
    const version = typeof receipt === 'undefined' ? CERTIFICATE_VERSIONS.v1dot1 : CERTIFICATE_VERSIONS.v1dot2;

    let {image: certificateImage, description, issuer, subtitle} = this.fullCertificateObject;

    const publicKey = recipient.publicKey;
    const chain = domain.addresses.isMainnet(publicKey) ? BLOCKCHAINS.bitcoin : BLOCKCHAINS.testnet;
    const expires = assertion.expires;
    const id = assertion.uid;
    const recipientFullName = `${recipient.givenName} ${recipient.familyName}`;
    const revocationKey = recipient.revocationKey || null;
    const sealImage = issuer.image;
    const signature = certificateJson.document.signature;
    const signaturesRaw = certificateJson.document && certificateJson.document.assertion && certificateJson.document.assertion['image:signature'];
    const signatureImage = this._getSignatureImages(signaturesRaw, version);
    if (typeof subtitle === 'object') {
      subtitle = subtitle.display ? subtitle.content : '';
    }
    let title = this.fullCertificateObject.title || this.fullCertificateObject.name;

    this._setProperties({
      certificateImage,
      chain,
      description,
      expires,
      id,
      issuer,
      publicKey,
      receipt,
      recipientFullName,
      revocationKey,
      sealImage,
      signature,
      signatureImage,
      subtitle,
      title,
      version
    });

    // TODO: should be actually checking something
    return true;
  }

  /**
   * parseV2
   *
   * @param certificateJson
   * @returns {Certificate}
   */
  _parseV2 (certificateJson) {
    const {id, expires, signature: receipt, badge} = certificateJson;
    const {image: certificateImage, name: title, description, subtitle, issuer} = badge;
    const issuerKey = certificateJson.verification.publicKey || certificateJson.verification.creator;
    const recipientProfile = certificateJson.recipientProfile || certificateJson.recipient.recipientProfile;

    // NEW
    const version = CERTIFICATE_VERSIONS.v2dot0;
    const chain = domain.certificates.getChain(certificateJson.signature, issuerKey);
    const publicKey = recipientProfile.publicKey;
    const recipientFullName = recipientProfile.name;
    const revocationKey = null;
    const sealImage = issuer.image;
    const signatureImage = this._getSignatureImages(badge.signatureLines, version);

    this._setProperties({
      certificateImage,
      chain,
      description,
      expires,
      id,
      issuer,
      publicKey,
      receipt,
      recipientFullName,
      revocationKey,
      sealImage,
      signature: null,
      signatureImage,
      subtitle,
      title,
      version
    });

    // TODO: should be actually checking something
    return true;
  }

  /**
   * _getSignatureImages
   *
   * @param signatureRawObject
   * @param certificateVersion
   * @returns {Array}
   * @private
   */
  _getSignatureImages (signatureRawObject, certificateVersion) {
    let signatureImageObjects = [];

    switch (certificateVersion) {
      case CERTIFICATE_VERSIONS.v1dot1:
      case CERTIFICATE_VERSIONS.v1dot2:
        if (signatureRawObject.constructor === Array) {
          for (let index in signatureRawObject) {
            let signatureLine = signatureRawObject[index];
            let jobTitle = 'jobTitle' in signatureLine ? signatureLine.jobTitle : null;
            let signerName = 'name' in signatureLine ? signatureLine.name : null;
            let signatureObject = new SignatureImage(signatureLine.image, jobTitle, signerName);
            signatureImageObjects.push(signatureObject);
          }
        } else {
          let signatureObject = new SignatureImage(signatureRawObject, null, null);
          signatureImageObjects.push(signatureObject);
        }
        break;

      case CERTIFICATE_VERSIONS.v2dot0:
        for (let index in signatureRawObject) {
          let signatureLine = signatureRawObject[index];
          let signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
          signatureImageObjects.push(signatureObject);
        }
        break;
    }

    return signatureImageObjects;
  }

  /**
   * _setTransactionDetails
   *
   * @private
   */
  _setTransactionDetails () {
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.rawTransactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain, true);
    this.transactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain);
  }

  /**
   * _updateStatusCallback
   *
   * calls the origin callback to update on a step status
   *
   * @param stepCode
   * @param message
   * @param status
   * @param errorMessage
   * @private
   */
  _updateStatusCallback (stepCode, stepReadableAction, status, errorMessage) {
    if (stepCode != null) {
      this._stepCallback(stepCode, stepReadableAction, status, errorMessage);
    }
  }

  /**
   * _succeed
   */
  _succeed (stepCode = '', message = '') {
    let status;
    if (
      this.chain.code === BLOCKCHAINS.mocknet.code ||
      this.chain.code === BLOCKCHAINS.regtest.code
    ) {
      log(
        'This mock Blockcert passed all checks. Mocknet mode is only used for issuers to test their workflow locally. This Blockcert was not recorded on a blockchain, and it should not be considered a verified Blockcert.'
      );
      status = Status.mockSuccess;
    } else {
      log('success');
      status = Status.success;
    }

    // TODO Better object to return (stepStatus instance)
    return { stepCode, message, status };
  }

  /**
   * _failed
   *
   * @param stepCode
   * @param message
   * @returns {{stepCode: string, message: string, status: string}}
   * @private
   */
  _failed (stepCode = '', message = '') {
    log(`failure:${message}`);
    // TODO Better object to return (stepStatus instance)
    return { stepCode, message, status: Status.failure };
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
    return this._stepsStatuses.length > 0 && this._stepsStatuses.indexOf(Status.failure) > -1;
  }

  /**
   * doAction
   *
   * @param stepCode
   * @param action
   * @returns {*}
   */
  _doAction (stepCode, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let readableAction = getVerboseMessage(stepCode);
    log(readableAction);
    this._updateStatusCallback(stepCode, readableAction, Status.starting);

    try {
      let res = action();
      this._updateStatusCallback(stepCode, readableAction, Status.success);
      this._stepsStatuses.push({ stepCode, status: Status.success, readableAction });
      return res;
    } catch (err) {
      this._updateStatusCallback(stepCode, readableAction, Status.failure, err.message);
      this._stepsStatuses.push({ stepCode, status: Status.failure, readableAction, message: err.message });
    }
  }

  /**
   * doAsyncAction
   *
   * @param stepCode
   * @param action
   * @returns {Promise<*>}
   */
  async _doAsyncAction (stepCode, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let readableAction = getVerboseMessage(stepCode);
    log(readableAction);
    this._updateStatusCallback(stepCode, readableAction, Status.starting);

    try {
      let res = await action();
      this._updateStatusCallback(stepCode, readableAction, Status.success);
      this._stepsStatuses.push({ stepCode, status: Status.success, readableAction });
      return res;
    } catch (err) {
      this._updateStatusCallback(stepCode, readableAction, Status.failure, err.message);
      this._stepsStatuses.push({ stepCode, status: Status.failure, readableAction, message: err.message });
    }
  }

  /**
   * verifyV1_2
   *
   * Verified certificate v1.2
   *
   * @returns {Promise<void>}
   */
  async _verifyV1dot2 () {
    // Get transaction
    // TODO use already computed this.certificate.transactionId
    let transactionId = this._doAction(
      Status.getTransactionId,
      () => checks.isTransactionIdValid(this.transactionId)
    );

    // Compute local hash
    let localHash = await this._doAsyncAction(
      Status.computingLocalHash,
      async () =>
        checks.computeLocalHash(this.documentToVerify, this.version)
    );

    // Get remote hash
    let txData = await this._doAsyncAction(Status.fetchingRemoteHash, async () =>
      blockchainConnectors.lookForTx(
        transactionId,
        this.chain.code,
        this.version
      )
    );

    // Get issuer profile
    let issuerProfileJson = await this._doAsyncAction(
      Status.gettingIssuerProfile,
      async () => getIssuerProfile(this.issuer.id)
    );

    // Parse issuer keys
    let issuerKeyMap = await this._doAsyncAction(
      Status.parsingIssuerKeys,
      () => parseIssuerKeys(issuerProfileJson)
    );

    // Compare hashes
    this._doAction(Status.comparingHashes, () => {
      checks.ensureHashesEqual(localHash, this.receipt.targetHash);
    });

    // Check merkle root
    this._doAction(Status.checkingMerkleRoot, () =>
      checks.ensureMerkleRootEqual(
        this.receipt.merkleRoot,
        txData.remoteHash
      )
    );

    // Check receipt
    this._doAction(Status.checkingReceipt, () =>
      checks.ensureValidReceipt(this.receipt)
    );

    // Check revoke status
    this._doAction(Status.checkingRevokedStatus, () =>
      checks.ensureNotRevokedBySpentOutput(
        txData.revokedAddresses,
        parseRevocationKey(issuerProfileJson),
        this.revocationKey
      )
    );

    // Check authenticity
    this._doAction(Status.checkingAuthenticity, () =>
      checks.ensureValidIssuingKey(
        issuerKeyMap,
        txData.issuingAddress,
        txData.time
      )
    );

    // Check expiration
    this._doAction(Status.checkingExpiresDate, () =>
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
    // Get transaction
    let transactionId = this._doAction(
      Status.getTransactionId,
      () => checks.isTransactionIdValid(this.transactionId)
    );

    // Compute local hash
    let localHash = await this._doAsyncAction(
      Status.computingLocalHash,
      async () =>
        checks.computeLocalHash(this.documentToVerify, this.version)
    );

    // Fetch remote hash
    let txData = await this._doAsyncAction(
      Status.fetchingRemoteHash,
      async () => {
        return blockchainConnectors.lookForTx(transactionId, this.chain.code);
      }
    );

    // Get issuer keys
    let issuerKeyMap = await this._doAsyncAction(
      Status.parsingIssuerKeys,
      async () => {
        return getIssuerKeys(this.issuer.id);
      }
    );

    // Get issuer keys
    let revokedAssertions = await this._doAsyncAction(
      null,
      async () => {
        return getRevokedAssertions(this.issuer.revocationList);
      }
    );

    // Compare hashes
    this._doAction(Status.comparingHashes, () =>
      checks.ensureHashesEqual(localHash, this.receipt.targetHash)
    );

    // Check merkle root
    this._doAction(Status.checkingMerkleRoot, () =>
      checks.ensureMerkleRootEqual(
        this.receipt.merkleRoot,
        txData.remoteHash
      )
    );

    // Check receipt
    this._doAction(Status.checkingReceipt, () =>
      checks.ensureValidReceipt(this.receipt)
    );

    // Check revoked status
    this._doAction(Status.checkingRevokedStatus, () =>
      checks.ensureNotRevokedByList(revokedAssertions, this.id)
    );

    // Check authenticity
    this._doAction(Status.checkingAuthenticity, () =>
      checks.ensureValidIssuingKey(
        issuerKeyMap,
        txData.issuingAddress,
        txData.time
      )
    );

    // Check expiration date
    this._doAction(Status.checkingExpiresDate, () =>
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
      Status.computingLocalHash,
      async () =>
        checks.computeLocalHash(this.document, this.version)
    );

    // Compare hashes
    this._doAction(Status.comparingHashes, () =>
      checks.ensureHashesEqual(localHash, this.receipt.targetHash)
    );

    // Check receipt
    this._doAction(Status.checkingReceipt, () =>
      checks.ensureValidReceipt(this.receipt)
    );

    // Check expiration date
    this._doAction(Status.checkingExpiresDate, () =>
      checks.ensureNotExpired(this.expires)
    );
  }
}
