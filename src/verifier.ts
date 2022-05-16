import debug from 'debug';
import { VERIFICATION_STATUSES } from './constants/verificationStatuses';
import domain from './domain';
import * as inspectors from './inspectors';
import { SUB_STEPS, VerificationSteps } from './constants/verificationSteps';
import { VerifierError } from './models';
import { getText } from './domain/i18n/useCases';
import MerkleProof2019 from './suites/MerkleProof2019';
import MerkleProof2017 from './suites/MerkleProof2017';
import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import type { Blockcerts } from './models/Blockcerts';
import type { IBlockchainObject } from './constants/blockchains';
import type { Issuer } from './models/Issuer';
import type { BlockcertsV3 } from './models/BlockcertsV3';
import type { IVerificationMapItem } from './domain/certificates/useCases/getVerificationMap';

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
  public revocationKey: string;
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
    { certificateJson, chain, expires, hashlinkVerifier, id, issuer, revocationKey, explorerAPIs }: {
      certificateJson: Blockcerts;
      chain: IBlockchainObject;
      expires: string;
      id: string;
      issuer: Issuer;
      hashlinkVerifier: HashlinkVerifier;
      revocationKey: string;
      explorerAPIs?: ExplorerAPI[];
    }
  ) {
    this.chain = chain;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.hashlinkVerifier = hashlinkVerifier;
    this.revocationKey = revocationKey;
    this.explorerAPIs = explorerAPIs;

    this.documentToVerify = Object.assign<any, Blockcerts>({}, certificateJson);

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
    this.supportedVerificationSuites = {
      MerkleProof2017,
      MerkleProof2019
    };

    this.merkleProofVerifier = new this.supportedVerificationSuites[this.getProofType(this.documentToVerify)]({
      actionMethod: this._doAction.bind(this),
      document: this.documentToVerify,
      explorerAPIs: this.explorerAPIs,
      issuer: this.issuer
    });

    this.prepareVerificationProcess();
  }

  getIssuerPublicKey (): string {
    return this.merkleProofVerifier.getIssuerPublicKey();
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

  _getRevocationListUrl (distantIssuerProfile: Issuer): string {
    return this.issuer.revocationList;
  }

  private getProofType (document: Blockcerts): string {
    if ('proof' in document) {
      return document.proof.type; // TODO: Make model getter
    } else if ('signature' in document) {
      return document.signature.type[0]; // TODO: Make model getter
    }
  }

  private prepareVerificationProcess (): void {
    const verificationModel = domain.certificates.getVerificationMap(!!this.issuer.didDocument);
    this.verificationSteps = verificationModel.verificationMap;
    this.verificationProcess = verificationModel.verificationProcess;

    this.registerSignatureVerificationSteps();
    this.registerIdentityVerificationSteps();

    this.verificationSteps = this.verificationSteps.filter(parentStep => parentStep.subSteps.length > 0);
  }

  private registerSignatureVerificationSteps (): void {
    const parentStep = VerificationSteps.proofVerification;
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
    const revocationListUrl = this._getRevocationListUrl(this.issuer);

    if (!revocationListUrl) {
      console.warn('No revocation list url was set on the issuer.');
      return;
    }
    const revokedCertificatesIds = await this._doAction(
      null,
      async () => await domain.verifier.getRevokedAssertions(revocationListUrl, this.id)
    );

    await this._doAction(SUB_STEPS.checkRevokedStatus, () =>
      inspectors.ensureNotRevoked(revokedCertificatesIds, this.id)
    );
  }

  private async checkExpiresDate (): Promise<void> {
    await this._doAction(SUB_STEPS.checkExpiresDate, () =>
      inspectors.ensureNotExpired(this.expires)
    );
  }

  private async controlVerificationMethod (): Promise<void> {
    // only v3 support
    await this._doAction(SUB_STEPS.controlVerificationMethod, () => {
      inspectors.controlVerificationMethod(this.issuer.didDocument, (this.documentToVerify as BlockcertsV3).proof.verificationMethod);
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
