import { VERIFICATION_STATUSES } from './constants/verificationStatuses';
import domain from './domain';
import ensureNotExpired from './inspectors/ensureNotExpired';
import { SUB_STEPS, VerificationSteps } from './domain/verifier/entities/verificationSteps';
import { VerifierError } from './models';
import { getText } from './domain/i18n/useCases';
import { difference } from './helpers/array';
import { getVCProofVerificationMethod, isVerifiablePresentation } from './models/BlockcertsV3';
import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import type { Blockcerts } from './models/Blockcerts';
import type { Issuer } from './models/Issuer';
import type { BlockcertsV3, VCProof } from './models/BlockcertsV3';
import type { IVerificationMapItem, IVerificationMapItemSuite } from './models/VerificationMap';
import type { Suite, SuiteAPI } from './models/Suite';
import type VerificationSubstep from './domain/verifier/valueObjects/VerificationSubstep';
import type { Signers } from './certificate';
import ensureValidityPeriodStarted from './inspectors/ensureValidityPeriodStarted';
import validateDateFormat from './inspectors/validateDateFormat';
import { isVCV2 } from './parsers/helpers/retrieveVCVersion';
import { cryptoSuiteToType } from './helpers/cryptoSuite';

export interface IVerificationStepCallbackAPI {
  code: string;
  label: string;
  status: VERIFICATION_STATUSES;
  errorMessage?: string;
  parentStep: string;
}

export type IVerificationStepCallbackFn = (update: IVerificationStepCallbackAPI) => any;
type TVerifierProofMap = Map<number, VCProof>;

export interface IFinalVerificationStatus {
  code: VerificationSteps.final;
  status: VERIFICATION_STATUSES;
  message: string;
  errors?: IFinalVerificationStatus[];
}

interface StepVerificationStatus {
  code: string;
  status: VERIFICATION_STATUSES;
  message?: string;
}

export enum SupportedVerificationSuites {
  MerkleProof2017 = 'MerkleProof2017',
  MerkleProof2019 = 'MerkleProof2019',
  Ed25519Signature2020 = 'Ed25519Signature2020',
  EcdsaSecp256k1Signature2019 = 'EcdsaSecp256k1Signature2019',
  EcdsaSd2023 = 'EcdsaSd2023'
}

export interface VerifierAPI {
  certificateJson: Blockcerts;
  expires: string;
  validFrom?: string;
  id: string;
  issuer: Issuer;
  hashlinkVerifier: HashlinkVerifier;
  revocationKey: string;
  explorerAPIs?: ExplorerAPI[];
  proofPurpose?: string;
  proofDomain?: string | string[];
  proofChallenge?: string;
}

export default class Verifier {
  public expires: string;
  public validFrom: string;
  public id: string;
  public issuer: Issuer;
  public revocationKey: string;
  public documentToVerify: Blockcerts;
  public explorerAPIs: ExplorerAPI[];
  public txData: TransactionData;
  private _stepsStatuses: StepVerificationStatus[] = [];
  private readonly hashlinkVerifier: HashlinkVerifier;
  public verificationSteps: IVerificationMapItem[];
  public supportedVerificationSuites: { [key in SupportedVerificationSuites]: Suite } = {
    [SupportedVerificationSuites.MerkleProof2017]: null,
    [SupportedVerificationSuites.MerkleProof2019]: null,
    [SupportedVerificationSuites.Ed25519Signature2020]: null,
    [SupportedVerificationSuites.EcdsaSecp256k1Signature2019]: null,
    [SupportedVerificationSuites.EcdsaSd2023]: null
  }; // defined here to later check if the proof type of the document is supported for verification

  public proofVerifiers: Suite[] = [];
  public verificationProcess: SUB_STEPS[];
  public proofMap: TVerifierProofMap;
  public proofPurpose?: string;
  public proofDomain?: string | string[];
  public proofChallenge?: string;

  constructor ({
    certificateJson,
    expires,
    hashlinkVerifier,
    id,
    issuer,
    revocationKey,
    explorerAPIs,
    validFrom,
    proofPurpose,
    proofDomain,
    proofChallenge
  }: VerifierAPI) {
    this.expires = expires;
    this.validFrom = validFrom;
    this.id = id;
    this.issuer = issuer;
    this.hashlinkVerifier = hashlinkVerifier;
    this.revocationKey = revocationKey;
    this.explorerAPIs = explorerAPIs;
    this.proofPurpose = proofPurpose;
    this.proofDomain = proofDomain;
    this.proofChallenge = proofChallenge;

    this.documentToVerify = Object.assign<any, Blockcerts>({}, certificateJson);
  }

  getVerificationSteps (): IVerificationMapItem[] {
    return this.verificationSteps;
  }

  getSignersData (): Signers[] {
    return this.proofVerifiers.map(proofVerifier => ({
      signingDate: proofVerifier.getSigningDate(),
      signatureSuiteType: proofVerifier.type,
      issuerPublicKey: proofVerifier.getIssuerPublicKey(),
      issuerName: proofVerifier.getIssuerName(),
      issuerProfileDomain: proofVerifier.getIssuerProfileDomain(),
      issuerProfileUrl: proofVerifier.getIssuerProfileUrl(),
      chain: proofVerifier.getChain?.(),
      transactionId: proofVerifier.getTransactionIdString?.(),
      transactionLink: proofVerifier.getTransactionLink?.(),
      rawTransactionLink: proofVerifier.getRawTransactionLink?.()
    }));
  }

  async init (): Promise<void> {
    await this.instantiateProofVerifiers();
    this.prepareVerificationProcess();
  }

  async verifyProof (): Promise<void> {
    for (let i = 0; i < this.proofVerifiers.length; i++) {
      await this.proofVerifiers[i].verifyProof();
    }
  }

  async verify (stepCallback: IVerificationStepCallbackFn = () => {}): Promise<IFinalVerificationStatus> {
    this._stepCallback = stepCallback;
    this._stepsStatuses = [];

    await this.verifyProof();

    for (const verificationStep of this.verificationProcess) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
    }

    for (let i = 0; i < this.proofVerifiers.length; i++) {
      await this.proofVerifiers[i].verifyIdentity();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === VERIFICATION_STATUSES.FAILURE);
    return erroredStep ? this._failed(erroredStep) : this._succeed();
  }

  private convertCryptosuiteToType (cryptoSuite: string): string {
    return cryptoSuiteToType(cryptoSuite);
  }

  private getRevocationListUrl (): string {
    return this.issuer.revocationList;
  }

  private getProofTypes (): string[] {
    const proofTypes: string[] = [];
    this.proofMap.forEach(proof => {
      let { type } = proof;
      if (type === 'ChainedProof2021') {
        type = proof.chainedProofType;
      }
      if (type === 'DataIntegrityProof') {
        type = this.convertCryptosuiteToType(proof.cryptosuite);
      }
      if (Array.isArray(type)) {
        // Blockcerts v2/MerkleProof2017
        type = type[0];
      }
      proofTypes.push(type);
    });

    return proofTypes;
  }

  private getProofMap (document: Blockcerts): TVerifierProofMap {
    const proofMap = new Map();
    if ('proof' in document) {
      if (Array.isArray(document.proof)) {
        document.proof.forEach((proof, i) => proofMap.set(i, proof));
      } else {
        proofMap.set(0, document.proof);
      }
    } else if ('signature' in document) {
      proofMap.set(0, document.signature);
    }
    return proofMap;
  }

  private async instantiateProofVerifiers (): Promise<void> {
    this.proofMap = this.getProofMap(this.documentToVerify);
    const proofTypes: string[] = this.getProofTypes();

    const unsupportedVerificationSuites = difference(Object.keys(this.supportedVerificationSuites), proofTypes);

    if (unsupportedVerificationSuites.length) {
      throw new Error(`No support for proof verification of type: ${unsupportedVerificationSuites.join(', ')}`);
    }

    // we have checked and now know the types of proof are supported, mutation is ok
    await this.loadRequiredVerificationSuites(proofTypes as SupportedVerificationSuites[]);

    this.proofMap.forEach((proof, index) => {
      const suiteOptions: SuiteAPI = {
        executeStep: this.executeStep.bind(this),
        document: this.documentToVerify,
        proof,
        explorerAPIs: this.explorerAPIs,
        issuer: this.issuer,
        proofPurpose: this.proofPurpose,
        proofDomain: this.proofDomain,
        proofChallenge: this.proofChallenge
      };

      this.proofVerifiers.push(new this.supportedVerificationSuites[proofTypes[index]](suiteOptions));
    });

    for (const proofVerifierSuite of this.proofVerifiers) {
      await proofVerifierSuite.init();
    }
  }

  private async loadRequiredVerificationSuites (documentProofTypes: SupportedVerificationSuites[]): Promise<void> {
    if (documentProofTypes.includes(SupportedVerificationSuites.MerkleProof2017)) {
      const { default: MerkleProof2017VerificationSuite } = await import('./suites/MerkleProof2017');
      this.supportedVerificationSuites.MerkleProof2017 = MerkleProof2017VerificationSuite as unknown as Suite;
    }

    if (documentProofTypes.includes(SupportedVerificationSuites.MerkleProof2019)) {
      const { default: MerkleProof2019VerificationSuite } = await import('./suites/MerkleProof2019');
      this.supportedVerificationSuites.MerkleProof2019 = MerkleProof2019VerificationSuite as unknown as Suite;
    }

    if (documentProofTypes.includes(SupportedVerificationSuites.Ed25519Signature2020)) {
      const { default: Ed25519Signature2020VerificationSuite } = await import('./suites/Ed25519Signature2020');
      this.supportedVerificationSuites.Ed25519Signature2020 = Ed25519Signature2020VerificationSuite as unknown as Suite;
    }

    if (documentProofTypes.includes(SupportedVerificationSuites.EcdsaSecp256k1Signature2019)) {
      const { default: EcdsaSecp256k1Signature2019VerificationSuite } = await import('./suites/EcdsaSecp256k1Signature2019');
      this.supportedVerificationSuites.EcdsaSecp256k1Signature2019 = EcdsaSecp256k1Signature2019VerificationSuite as unknown as Suite;
    }

    if (documentProofTypes.includes(SupportedVerificationSuites.EcdsaSd2023)) {
      const { default: EcdsaSd2023VerificationSuite } = await import('./suites/EcdsaSd2023');
      this.supportedVerificationSuites.EcdsaSd2023 = EcdsaSd2023VerificationSuite as unknown as Suite;
    }
  }

  private prepareVerificationProcess (): void {
    const verificationModel = domain.verifier.getVerificationMap({
      hasDid: !!this.issuer.didDocument,
      hasHashlinks: this.hashlinkVerifier?.hasHashlinksToVerify() ?? false,
      hasValidFrom: !!this.validFrom,
      hasCredentialSchema: !!(this.documentToVerify as BlockcertsV3).credentialSchema,
      isVCV2: isVCV2(this.documentToVerify['@context']),
      isVerifiablePresentation: isVerifiablePresentation(this.documentToVerify as BlockcertsV3),
      isIssuerProfileSigned: !!this.issuer.proof
    });
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

  private getSuiteSubsteps (parentStep: VerificationSteps): IVerificationMapItemSuite[] {
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

  private async executeStep (step: string, action: () => any, verificationSuite?: string): Promise<any> {
    if (this._isFailing()) {
      return;
    }

    if (step) {
      this._updateStatusCallback(step, VERIFICATION_STATUSES.STARTING, verificationSuite);
    }

    try {
      const res: any = await action();
      if (step) {
        this._updateStatusCallback(step, VERIFICATION_STATUSES.SUCCESS, verificationSuite);
        this._stepsStatuses.push({ code: step, status: VERIFICATION_STATUSES.SUCCESS });
      }
      return res;
    } catch (err) {
      console.error(err);
      if (step) {
        this._updateStatusCallback(step, VERIFICATION_STATUSES.FAILURE, verificationSuite, err.message);
        this._stepsStatuses.push({
          code: step,
          message: err.message,
          status: VERIFICATION_STATUSES.FAILURE
        });
      }
    }
  }

  private _stepCallback (update: IVerificationStepCallbackAPI): any { // TODO: unsure type is indeed any
    // defined by this.verify interface
  }

  private async checkImagesIntegrity (): Promise<void> {
    await this.executeStep(
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
    if ((this.documentToVerify as BlockcertsV3).credentialStatus) {
      const { default: checkRevocationStatusList2021 } = await import('./inspectors/checkRevocationStatusList2021');
      await this.executeStep(SUB_STEPS.checkRevokedStatus, async () => {
        await checkRevocationStatusList2021((this.documentToVerify as BlockcertsV3).credentialStatus);
      });
      return;
    }
    const revocationListUrl = this.getRevocationListUrl();

    if (!revocationListUrl) {
      console.warn('No revocation list url was set on the issuer.');
      await this.executeStep(SUB_STEPS.checkRevokedStatus, () => true);
      return;
    }
    const revokedCertificatesIds = await this.executeStep(
      null,
      async () => await domain.verifier.getRevokedAssertions(revocationListUrl, this.id)
    );

    const { default: ensureNotRevoked } = await import('./inspectors/ensureNotRevoked');

    await this.executeStep(SUB_STEPS.checkRevokedStatus, () => { ensureNotRevoked(revokedCertificatesIds, this.id); }
    );
  }

  private async checkExpiresDate (): Promise<void> {
    await this.executeStep(SUB_STEPS.checkExpiresDate, () => { ensureNotExpired(this.expires); }
    );
  }

  private async ensureValidityPeriodStarted (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.ensureValidityPeriodStarted,
      () => { ensureValidityPeriodStarted(this.validFrom); }
    );
  }

  private async validateDateFormat (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.validateDateFormat,
      () => {
        const datesToValidate = domain.verifier.getDatesToValidate(this.documentToVerify as BlockcertsV3);
        validateDateFormat(datesToValidate);
      }
    );
  }

  private async checkCredentialSchemaConformity (): Promise<void> {
    const { default: checkCredentialSchemaConformity } = await import('./inspectors/checkCredentialSchemaConformity');
    await this.executeStep(
      SUB_STEPS.checkCredentialSchemaConformity,
      async () => {
        await checkCredentialSchemaConformity(
          (this.documentToVerify as BlockcertsV3).credentialSubject,
          (this.documentToVerify as BlockcertsV3).credentialSchema
        );
      }
    );
  }

  private async controlVerificationMethod (): Promise<void> {
    // only v3 support
    if (!this.issuer.didDocument) {
      return;
    }

    const { default: controlVerificationMethod } = await import('./inspectors/did/controlVerificationMethod');

    await this.executeStep(SUB_STEPS.controlVerificationMethod, () => {
      controlVerificationMethod(
        this.issuer.didDocument,
        getVCProofVerificationMethod((this.documentToVerify as BlockcertsV3).proof)
      );
    });
  }

  private async verifyIssuerProfile (): Promise<void> {
    // only v3 support
    // console.log('We will verify the issuer profile', this.issuer);
    if (!this.issuer.proof) {
      return;
    }

    const { default: verifyIssuerProfile } = await import('./inspectors/verifyIssuerProfile');

    await this.executeStep(SUB_STEPS.verifyIssuerProfile, async () => {
      await verifyIssuerProfile(this.issuer);
    });
  }

  private findStepFromVerificationProcess (code: string, verificationSuite: string): VerificationSubstep {
    return domain.verifier.findVerificationSubstep(code, this.verificationSteps, verificationSuite);
  }

  private _failed (errorStep: StepVerificationStatus): IFinalVerificationStatus {
    const { message } = errorStep;
    return this._setFinalStep({ status: VERIFICATION_STATUSES.FAILURE, message });
  }

  private _isFailing (): boolean {
    return this._stepsStatuses.some(step => step.status === VERIFICATION_STATUSES.FAILURE);
  }

  private _succeed (): IFinalVerificationStatus {
    let message;

    if (this.proofVerifiers.length === 1) {
      if (this.proofVerifiers[0].type.includes('MerkleProof')) {
        message = domain.chains.isMockChain(this.proofVerifiers[0].getChain())
          ? domain.i18n.getComposedText('success', 'mocknet')
          : domain.i18n.getComposedText('success', 'blockchain');
      } else {
        message = {
          ...domain.i18n.getComposedText('success', 'generic'),
          description: domain.i18n.getComposedText('success', 'generic').description
            .replace('${SIGNATURE_TYPE}', this.proofVerifiers[0].type)
        };
      }
    }

    if (this.proofVerifiers.length > 1) {
      message = domain.i18n.getComposedText('success', 'multisign');
    }
    return this._setFinalStep({ status: VERIFICATION_STATUSES.SUCCESS, message });
  }

  private _setFinalStep ({ status, message }: { status: VERIFICATION_STATUSES; message: string }): IFinalVerificationStatus {
    return { code: VerificationSteps.final, status, message };
  }

  private _updateStatusCallback (code: string, status: VERIFICATION_STATUSES, verificationSuite = '', errorMessage = ''): void {
    if (code != null) {
      const step: VerificationSubstep = this.findStepFromVerificationProcess(code, verificationSuite);
      if (step === undefined) {
        // TODO: this happens when the verification method references a public key in a hosted issuer profile
        // TODO: as it is not considered a DID, CVJS does not add an identity verification check
        // TODO: we should likely enforce identity verification when the verification method is set
        console.warn('step with code', code, 'was not found for suite', verificationSuite, 'ignoring but you should not.');
        return;
      }
      const update: IVerificationStepCallbackAPI = {
        code,
        status,
        parentStep: step.parentStep,
        label: step.labelPending
      };
      if (errorMessage) {
        update.errorMessage = errorMessage;
      }
      this._stepCallback(update);
    }
  }
}
