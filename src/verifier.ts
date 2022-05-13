import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import debug from 'debug';
import { VERIFICATION_STATUSES } from './constants/verificationStatuses';
import Versions from './constants/certificateVersions';
import domain from './domain';
import * as inspectors from './inspectors';
import type { Blockcerts } from './models/Blockcerts';
import type { IBlockchainObject } from './constants/blockchains';
import type { Issuer } from './models/Issuer';
import { SUB_STEPS, VerificationSteps } from './constants/verificationSteps';
import type { IVerificationMapItem } from './domain/certificates/useCases/getVerificationMap';
import type { Receipt } from './models/Receipt';
import { VerifierError } from './models';
import { getText } from './domain/i18n/useCases';
import type { VCProof } from './models/BlockcertsV3';
import MerkleProof2019 from './suites/MerkleProof2019';
import MerkleProof2017 from './suites/MerkleProof2017';

const log = debug('Verifier');

export interface IVerificationStepCallbackAPI {
  code: string;
  label: string;
  status: string; // TODO: use enum
  errorMessage?: string;
}

export type IVerificationStepCallbackFn = (update: IVerificationStepCallbackAPI) => any;

export interface IFinalVerificationStatus {
  code: VerificationSteps.final;
  status: string; // TODO: use enum
  message: string;
}

export default class Verifier {
  public chain: IBlockchainObject;
  public expires: string;
  public id: string;
  public issuer: Issuer;
  public receipt: Receipt;
  public proof?: VCProof | VCProof[];
  public revocationKey: string;
  public version: Versions;
  public documentToVerify: Blockcerts;
  public explorerAPIs: ExplorerAPI[];
  public txData: TransactionData;
  private _stepsStatuses: any[]; // TODO: define stepStatus interface
  private readonly hashlinkVerifier: HashlinkVerifier;
  public verificationSteps: IVerificationMapItem[];
  public supportedVerificationSuites: any;
  public merkleProofVerifier: any;
  public verificationProcess: SUB_STEPS[];

  constructor (
    { certificateJson, chain, expires, hashlinkVerifier, id, issuer, receipt, revocationKey, version, explorerAPIs, proof }: {
      certificateJson: Blockcerts;
      chain: IBlockchainObject;
      expires: string;
      id: string;
      issuer: Issuer;
      hashlinkVerifier: HashlinkVerifier;
      receipt: Receipt;
      revocationKey: string;
      version: Versions;
      explorerAPIs?: ExplorerAPI[];
      proof?: any;
    }
  ) {
    this.chain = chain;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.hashlinkVerifier = hashlinkVerifier;
    this.receipt = receipt;
    this.revocationKey = revocationKey;
    this.version = version;
    this.explorerAPIs = explorerAPIs;
    this.proof = proof;

    this.documentToVerify = Object.assign<any, Blockcerts>({}, certificateJson);

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
    this.supportedVerificationSuites = {
      MerkleProof2017,
      MerkleProof2019
    };

    this.merkleProofVerifier = new this.supportedVerificationSuites[(this.proof as VCProof).type]({
      actionMethod: this._doAction.bind(this),
      document: this.documentToVerify,
      explorerAPIs: this.explorerAPIs,
      receipt: this.receipt,
      version: this.version,
      issuer: this.issuer,
      proof: this.proof
    });

    this.prepareVerificationProcess();
  }

  // MerkleProof2017/2019 concern
  getIssuingAddress (): string {
    if (!this.txData) {
      console.error('Trying to access issuing address when txData not available yet. Did you run the `verify` method yet?');
    }
    return this.txData?.issuingAddress;
  }

  async verify (stepCallback: IVerificationStepCallbackFn = () => {}): Promise<IFinalVerificationStatus> {
    this._stepCallback = stepCallback;
    this._stepsStatuses = [];

    await this.merkleProofVerifier.verifyProof();

    for (const verificationStep of this.verificationProcess) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
    }

    if (this.merkleProofVerifier.verifyIdentity) {
      await this.merkleProofVerifier.verifyIdentity();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === VERIFICATION_STATUSES.FAILURE);
    return erroredStep ? this._failed(erroredStep) : this._succeed();
  }

  _getRevocationListUrl (distantIssuerProfile: Issuer): any { // TODO: define revocationList type
    if (this.issuer?.revocationList) {
      return this.issuer.revocationList;
    }
    return distantIssuerProfile.revocationList;
  }

  private prepareVerificationProcess (): void {
    const verificationModel = domain.certificates.getVerificationMap(this.chain, this.version, !!this.issuer.didDocument);
    this.verificationSteps = verificationModel.verificationMap;
    this.verificationProcess = verificationModel.verificationProcess;

    this.registerSignatureVerificationSteps();
    this.registerIdentityVerificationSteps();

    this.verificationSteps = this.verificationSteps.filter(parentStep => parentStep.subSteps.length > 0);
  }

  private registerSignatureVerificationSteps (): void {
    const parentStep = VerificationSteps.signatureVerification;
    this.verificationSteps
      .find(step => step.code === parentStep)
      .subSteps = this.merkleProofVerifier.getProofVerificationSteps(parentStep);
  }

  private registerIdentityVerificationSteps (): void {
    const parentStep = VerificationSteps.identityVerification;
    const parentBlock = this.verificationSteps
      .find(step => step.code === parentStep);

    parentBlock.subSteps = [
      ...parentBlock.subSteps,
      ...this.merkleProofVerifier.getIdentityVerificationSteps(parentStep)
    ];
  }

  private async _doAction (step: string, action: () => any): Promise<any> {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let label: string;
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

  private async checkImagesIntegrity (): Promise<void> {
    await this._doAction(
      SUB_STEPS.checkImagesIntegrity,
      async () => {
        await this.hashlinkVerifier.verifyHashlinkTable()
          .catch((error) => {
            console.error('hashlink verification error', error);
            throw new VerifierError(SUB_STEPS.checkImagesIntegrity, getText('errors', 'checkImagesIntegrity'));
          });
      }
    );
  }

  private async checkRevokedStatus (): Promise<void> {
    let keys;
    let revokedAddresses;
    if (this.version === Versions.V1_2) {
      revokedAddresses = this.txData.revokedAddresses;
      keys = [
        domain.verifier.parseRevocationKey(this.issuer),
        this.revocationKey
      ];
    } else {
      // Get revoked assertions
      revokedAddresses = await this._doAction(
        null,
        async () => await domain.verifier.getRevokedAssertions(this._getRevocationListUrl(this.issuer), this.id)
      );
      keys = this.id;
    }

    await this._doAction(SUB_STEPS.checkRevokedStatus, () =>
      inspectors.ensureNotRevoked(revokedAddresses, keys)
    );
  }

  private async checkExpiresDate (): Promise<void> {
    await this._doAction(SUB_STEPS.checkExpiresDate, () =>
      inspectors.ensureNotExpired(this.expires)
    );
  }

  private async controlVerificationMethod (): Promise<void> {
    await this._doAction(SUB_STEPS.controlVerificationMethod, () => {
      inspectors.controlVerificationMethod(this.issuer.didDocument, (this.proof as VCProof).verificationMethod);
    });
  }

  /**
   * Returns a failure final step message
   */
  _failed (errorStep: IVerificationStepCallbackAPI): IFinalVerificationStatus {
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
    return { code: VerificationSteps.final, status, message };
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
