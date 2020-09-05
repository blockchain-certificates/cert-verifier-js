import { STEPS, SUB_STEPS, VERIFICATION_STATUSES } from './constants';
import debug from 'debug';
import Versions, { isV3 } from './constants/certificateVersions';
import VerifierError from './models/verifierError';
import domain from './domain';
import * as inspectors from './inspectors';
import { Blockcerts } from './models/Blockcerts';
import { ExplorerAPI } from './certificate';
import { IBlockchainObject } from './constants/blockchains';
import { explorerFactory, TExplorerFunctionsArray } from './explorers/explorer';
import { getDefaultExplorers, TDefaultExplorersPerBlockchain } from './explorers';

const log = debug('Verifier');

export interface IVerificationStepCallbackAPI {
  code: string;
  label: string;
  status: string; // TODO: use enum
  errorMessage?: string;
}

export type IVerificationStepCallbackFn = (update: IVerificationStepCallbackAPI) => any;
export type TExplorerAPIs = TDefaultExplorersPerBlockchain & {
  custom?: TExplorerFunctionsArray;
};

export interface IFinalVerificationStatus {
  code: STEPS.final;
  status: string; // TODO: use enum
  message: string;
}

export default class Verifier {
  public chain: IBlockchainObject;
  public expires: string;
  public id: string;
  public issuer: any; // TODO: define issuer interface
  public receipt: any; // TODO: define receipt interface
  public revocationKey: string;
  public version: Versions;
  public transactionId: string;
  public documentToVerify: Blockcerts; // TODO: confirm this
  public explorerAPIs: TExplorerAPIs;
  private readonly _stepsStatuses: any[]; // TODO: define stepStatus interface

  constructor (
    { certificateJson, chain, expires, id, issuer, receipt, revocationKey, transactionId, version, explorerAPIs }: {
      certificateJson: Blockcerts;
      chain: IBlockchainObject;
      expires: string;
      id: string;
      issuer: any;
      receipt: any;
      revocationKey: string;
      transactionId: string;
      version: Versions;
      explorerAPIs?: ExplorerAPI[];
    }
  ) {
    this.chain = chain;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.receipt = receipt;
    this.revocationKey = revocationKey;
    this.version = version;
    this.transactionId = transactionId;
    this.setExplorerAPIs(explorerAPIs);

    let document = certificateJson.document;
    if (!document) {
      document = this._retrieveDocumentBeforeIssuance(certificateJson);
    }

    this.documentToVerify = Object.assign({}, document);

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
  }

  async verify (stepCallback: IVerificationStepCallbackFn = () => {}): Promise<IFinalVerificationStatus> {
    this._stepCallback = stepCallback;

    if (this.version === Versions.V1_1) {
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

  setExplorerAPIs (customExplorerAPIs: ExplorerAPI[]): void {
    this.explorerAPIs = getDefaultExplorers(customExplorerAPIs);

    if (domain.explorerAPIs.ensureValidity(customExplorerAPIs)) {
      this.explorerAPIs.custom = explorerFactory(customExplorerAPIs);
    }
  }

  _getRevocationListUrl (distantIssuerProfile): any { // TODO: define revocationList type
    if (this.issuer && this.issuer.revocationList) {
      return this.issuer.revocationList;
    }
    return distantIssuerProfile.revocationList;
  }

  _doAction (step: string, action: Function): any {
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
      const res: any = action();
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

  async _doAsyncAction (step: string, action: Function): Promise<any> {
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
      const res: any = await action();
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

  private _stepCallback (update: IVerificationStepCallbackAPI): any { // TODO: unsure type is indeed any
    // defined by this.verify interface
  }

  async _verifyMain (): Promise<void> {
    // Check transaction id validity
    this._doAction(
      SUB_STEPS.getTransactionId,
      () => inspectors.isTransactionIdValid(this.transactionId)
    );

    // Compute local hash
    const localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () => await inspectors.computeLocalHash(this.documentToVerify, this.version)
    );

    // Fetch remote hash
    const txData = await this._doAsyncAction(
      SUB_STEPS.fetchRemoteHash,
      async () => await domain.verifier.lookForTx({
        transactionId: this.transactionId,
        chain: this.chain.code,
        certificateVersion: this.version,
        explorerAPIs: this.explorerAPIs
      })
    );

    // Get issuer profile
    let issuerProfileJson = this.issuer;
    if (!isV3(this.version)) {
      issuerProfileJson = await this._doAsyncAction(
        SUB_STEPS.getIssuerProfile,
        async () => await domain.verifier.getIssuerProfile(this.issuer)
      );
    }

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
    if (this.version === Versions.V1_2) {
      revokedAddresses = txData.revokedAddresses;
      keys = [
        domain.verifier.parseRevocationKey(issuerProfileJson),
        this.revocationKey
      ];
    } else {
      // Get revoked assertions
      revokedAddresses = await this._doAsyncAction(
        null,
        async () => await domain.verifier.getRevokedAssertions(this._getRevocationListUrl(issuerProfileJson), this.id)
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

  async _verifyV2Mock (): Promise<void> {
    // Compute local hash
    const localHash = await this._doAsyncAction(
      SUB_STEPS.computeLocalHash,
      async () =>
        await inspectors.computeLocalHash(this.documentToVerify, this.version)
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
   * Returns a failure final step message
   */
  _failed (errorStep): IFinalVerificationStatus { // TODO: define errorStep interface
    const message: string = errorStep.errorMessage;
    log(`failure:${message}`);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.FAILURE, message });
  }

  /**
   * whether or not the current verification is failing
   */
  _isFailing (): boolean {
    return this._stepsStatuses.some(step => step.status === VERIFICATION_STATUSES.FAILURE);
  }

  _retrieveDocumentBeforeIssuance (certificateJson): any { // TODO: define certificate object
    const certificateCopy = Object.assign({}, certificateJson);
    if (isV3(this.version)) {
      delete certificateCopy.proof;
    } else {
      delete certificateCopy.signature;
    }
    return certificateCopy;
  }

  /**
   * Returns a final success message
   */
  _succeed (): IFinalVerificationStatus {
    const message = domain.chains.isMockChain(this.chain)
      ? domain.i18n.getText('success', 'mocknet')
      : domain.i18n.getText('success', 'blockchain');
    log(message);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.SUCCESS, message });
  }

  _setFinalStep ({ status, message }: { status: string; message: string }): IFinalVerificationStatus {
    return { code: STEPS.final, status, message };
  }

  /**
   * calls the origin callback to update on a step status
   */
  private _updateStatusCallback (code: string, label: string, status: string, errorMessage = ''): void {
    if (code != null) {
      const update: IVerificationStepCallbackAPI = { code, label, status };
      if (errorMessage) {
        update.errorMessage = errorMessage;
      }
      this._stepCallback(update);
    }
  }
}
