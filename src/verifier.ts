import debug from 'debug';
import { VERIFICATION_STATUSES } from './constants/verificationStatuses';
import domain from './domain';
import * as inspectors from './inspectors';
import { SUB_STEPS, VerificationSteps } from './constants/verificationSteps';
import { VerifierError } from './models';
import { getText } from './domain/i18n/useCases';
import MerkleProof2019 from './suites/MerkleProof2019';
import MerkleProof2017 from './suites/MerkleProof2017';
import Ed25519Signature2020 from './suites/Ed25519Signature2020';
import { getMerkleProof2017ProofType } from './models/MerkleProof2017';
import { getMerkleProof2019ProofType, getMerkleProof2019VerificationMethod } from './models/MerkleProof2019';
import { difference, lastEntry } from './helpers/array';
import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import type { Blockcerts } from './models/Blockcerts';
import type { Issuer } from './models/Issuer';
import type { BlockcertsV3 } from './models/BlockcertsV3';
import type { IBlockchainObject } from './constants/blockchains';
import type { Receipt } from './models/Receipt';
import type { IVerificationMapItem } from './models/VerificationMap';
import type { Suite } from './models/Suite';

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
  public proofVerifiers: Suite[];
  public verificationProcess: SUB_STEPS[];

  constructor (
    { certificateJson, expires, hashlinkVerifier, id, issuer, revocationKey, explorerAPIs }: {
      certificateJson: Blockcerts;
      expires: string;
      id: string;
      issuer: Issuer;
      hashlinkVerifier: HashlinkVerifier;
      revocationKey: string;
      explorerAPIs?: ExplorerAPI[];
    }
  ) {
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

    this.instantiateProofVerifiers();
    this.prepareVerificationProcess();
  }

  getIssuerPublicKey (): string {
    // TODO: temporary workaround to maintain MerkleProof201x data access
    return lastEntry(this.proofVerifiers).getIssuerPublicKey();
  }

  getChain (): IBlockchainObject {
    // TODO: temporary workaround to maintain MerkleProof201x data access
    return lastEntry(this.proofVerifiers).getChain();
  }

  getReceipt (): Receipt {
    // TODO: temporary workaround to maintain MerkleProof201x data access
    return lastEntry(this.proofVerifiers).getReceipt();
  }

  getVerificationSteps (): IVerificationMapItem[] {
    return this.verificationSteps;
  }

  async verify (stepCallback: IVerificationStepCallbackFn = () => {}): Promise<IFinalVerificationStatus> {
    this._stepCallback = stepCallback;
    this._stepsStatuses = [];

    // TODO: temporary workaround to maintain MerkleProof201x data access
    await lastEntry(this.proofVerifiers).verifyProof();

    for (const verificationStep of this.verificationProcess) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
    }

    // TODO: temporary workaround to maintain MerkleProof201x data access
    if (lastEntry(this.proofVerifiers).verifyIdentity) {
      await lastEntry(this.proofVerifiers).verifyIdentity();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === VERIFICATION_STATUSES.FAILURE);
    return erroredStep ? this._failed(erroredStep) : this._succeed();
  }

  private getRevocationListUrl (): string {
    return this.issuer.revocationList;
  }

  private getProofTypes (document: Blockcerts): string[] {
    if ('proof' in document) {
      if (Array.isArray(document.proof)) {
        return document.proof.map(p => {
          if (p.type === 'ChainedProof2021') {
            return p.chainedProofType;
          }
          return p.type;
        });
      }
      return [getMerkleProof2019ProofType(document)];
    } else if ('signature' in document) {
      return [getMerkleProof2017ProofType(document)];
    }
  }

  private instantiateProofVerifiers (): void {
    this.supportedVerificationSuites = {
      MerkleProof2017,
      MerkleProof2019,
      Ed25519Signature2020
    };
    const proofTypes: string[] = this.getProofTypes(this.documentToVerify);

    const unsupportedVerificationSuites = difference(Object.keys(this.supportedVerificationSuites), proofTypes);

    if (unsupportedVerificationSuites.length) {
      throw new Error(`No support for proof verification of type: ${unsupportedVerificationSuites.join(', ')}`);
    }

    this.proofVerifiers = proofTypes.map(proofType => new this.supportedVerificationSuites[proofType]({
      actionMethod: this._doAction.bind(this),
      document: this.documentToVerify,
      explorerAPIs: this.explorerAPIs,
      issuer: this.issuer
    }));
  }

  private prepareVerificationProcess (): void {
    const verificationModel = domain.certificates.getVerificationMap(!!this.issuer.didDocument);
    this.verificationSteps = verificationModel.verificationMap;
    this.verificationProcess = verificationModel.verificationProcess;

    this.registerSignatureVerificationSteps();
    this.registerIdentityVerificationSteps();

    this.verificationSteps = this.verificationSteps.filter(parentStep =>
      parentStep.subSteps?.length > 0 || parentStep.suites?.some(suite => suite.subSteps.length > 0)
    );
  }

  private registerSignatureVerificationSteps (): void {
    const parentStep = VerificationSteps.proofVerification;
    this.verificationSteps
      .find(step => step.code === parentStep)
      .suites = this.getSuiteSubsteps(parentStep);
  }

  private getSuiteSubsteps (parentStep: VerificationSteps): any {
    const targetMethodMap = {
      [VerificationSteps.proofVerification]: 'getProofVerificationSteps',
      [VerificationSteps.identityVerification]: 'getIdentityVerificationSteps'
    };
    return this.proofVerifiers.map(proofVerifier => ({
      proofType: proofVerifier.type,
      subSteps: proofVerifier[targetMethodMap[parentStep]](parentStep)
    }));
  }

  private registerIdentityVerificationSteps (): void {
    const parentStep = VerificationSteps.identityVerification;
    this.verificationSteps
      .find(step => step.code === parentStep)
      .suites = this.getSuiteSubsteps(parentStep);
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
    const revocationListUrl = this.getRevocationListUrl();

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
      inspectors.controlVerificationMethod(
        this.issuer.didDocument,
        getMerkleProof2019VerificationMethod(this.documentToVerify as BlockcertsV3)
      );
    });
  }

  _failed (errorStep: IVerificationStepCallbackAPI): IFinalVerificationStatus {
    const message: string = errorStep.errorMessage;
    log(`failure:${message}`);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.FAILURE, message });
  }

  _isFailing (): boolean {
    return this._stepsStatuses.some(step => step.status === VERIFICATION_STATUSES.FAILURE);
  }

  _succeed (): IFinalVerificationStatus {
    // TODO: temporary workaround to maintain MerkleProof201x data access
    const message = domain.chains.isMockChain(lastEntry(this.proofVerifiers).getChain())
      ? domain.i18n.getText('success', 'mocknet')
      : domain.i18n.getText('success', 'blockchain');
    log(message);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.SUCCESS, message });
  }

  _setFinalStep ({ status, message }: { status: string; message: string }): IFinalVerificationStatus {
    return { code: VerificationSteps.final, status, message };
  }

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
