import domain from '../domain';
import {cryptosuite as eddsaRdfc2022CryptoSuite} from '@digitalbazaar/eddsa-rdfc-2022-cryptosuite';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import jsigs from 'jsonld-signatures';
import jsonld from 'jsonld';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Suite, type SuiteAPI } from '../models/Suite';
import type { VCProof } from '../models/BlockcertsV3';
import type { Blockcerts } from '../models/Blockcerts';
import type { Issuer } from '../models/Issuer';
import type IVerificationMethod from '../models/VerificationMethod';
import VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import { Ed25519KeyPair } from '@transmute/ed25519-key-pair';
import { preloadedContexts } from '../constants';
import { BlockcertsV3 } from '../models/BlockcertsV3';
import { IDidDocument } from '../models/DidDocument';
import { VerifierError } from '../models';
import { jwkToMultibaseEd25519 } from '../helpers/keyUtils';

const { purposes: { AssertionProofPurpose, AuthenticationProofPurpose } } = jsigs;

enum SUB_STEPS {
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  ensureVerificationMethodValidity = 'ensureVerificationMethodValidity',
  checkDocumentSignature = 'checkDocumentSignature'
}

export default class EddsaRdfc2022 extends Suite {
  public verificationProcess = [
    SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.ensureVerificationMethodValidity,
    SUB_STEPS.checkDocumentSignature
  ];
  public documentToVerify: Blockcerts;
  public issuer: Issuer;
  public proof: VCProof;
  public type = 'EddsaRdfc2022';
  public cryptosuite = 'eddsa-rdfc-2022';
  public multikeyRepresentation: Ed25519Multikey;
  public verificationKey: Ed25519VerificationKey2020;
  public verificationMethod: IVerificationMethod;
  public publicKey: string;
  public proofPurpose: string;
  public challenge: string;
  public domain: string | string[];
  private readonly proofPurposeMap: any;

  constructor (props: SuiteAPI) {
    super(props);
    if (props.executeStep) {
      this.executeStep = props.executeStep;
    }
    this.documentToVerify = props.document;
    this.issuer = props.issuer;
    this.proof = props.proof as VCProof;
    this.proofPurpose = props.proofPurpose ?? 'assertionMethod';
    this.challenge = props.proofChallenge ?? '';
    this.domain = props.proofDomain;
    this.proofPurposeMap = {
      authentication: AuthenticationProofPurpose,
      assertionMethod: AssertionProofPurpose
    };
    this.validateProofType();
  }

  async init (): Promise<void> {}

  async verifyProof (): Promise<void> {
    for (const verificationStep of this.verificationProcess) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
    }
  }

  async verifyIdentity (): Promise<void> {}

  getProofVerificationSteps (parentStepKey): VerificationSubstep[] {
    // TODO: for now we are relying on i18n from this package, eventually we would want to split it and make this suite
    // TODO: standalone
    return this.verificationProcess.map(childStepKey =>
      domain.verifier.convertToVerificationSubsteps(parentStepKey, childStepKey)
    );
  }

  getIdentityVerificationSteps (): VerificationSubstep[] {
    return [];
  }

  getIssuerPublicKey (): string {
    return this.publicKey;
  }

  getIssuerName (): string {
    return this.issuer.name ?? '';
  }

  getIssuerProfileDomain (): string {
    try {
      const issuerProfileUrl = new URL(this.getIssuerProfileUrl());
      return issuerProfileUrl.hostname ?? '';
    } catch (e) {
      return '';
    }
  }

  getIssuerProfileUrl (): string {
    return this.issuer.id ?? '';
  }

  getSigningDate (): string {
    return this.proof.created;
  }

  async executeStep (step: string, action, verificationSuite: string): Promise<any> {
    throw new Error('doAction method needs to be overwritten by injecting from CVJS');
  }

  private async publicKeyJwkToString (publicKeyJwk: any): Promise<string> {
    const publicKeyString = await Ed25519KeyPair.fingerprintFromPublicKey(publicKeyJwk);
    return publicKeyString;
  }

  private validateProofType (): void {
    const proofType = this.isProofChain() ? this.proof.chainedProofType : this.proof.type;
    if (proofType === 'DataIntegrityProof') {
      const proofCryptoSuite = this.proof.cryptosuite;
      if (!proofCryptoSuite) {
        throw new Error(`Malformed proof passed. With DataIntegrityProof a cryptosuite must be defined. Expected: ${this.cryptosuite}`);
      }

      if (proofCryptoSuite !== this.cryptosuite) {
        throw new Error(`Incompatible proof cryptosuite passed. Expected: ${this.cryptosuite}, Got: ${proofCryptoSuite}`);
      }
      return;
    }
    if (proofType !== this.type) {
      throw new Error(`Incompatible proof type passed. Expected: ${this.type}, Got: ${proofType}`);
    }
  }

  private isProofChain (): boolean {
    return this.proof.type === 'ChainedProof2021';
  }

  private generateDocumentLoader (): any {
    preloadedContexts[(this.documentToVerify as BlockcertsV3).issuer as string] = this.issuer.didDocument;
    preloadedContexts[this.proof.verificationMethod] = this.getMultikeyRepresentation();
    const customLoader = function (url): any {
      if (url in preloadedContexts) {
        return {
          contextUrl: null,
          document: preloadedContexts[url],
          documentUrl: url
        };
      }
      return jsonld.documentLoader(url);
    };
    return customLoader;
  }

  private getErrorMessage (verificationStatus): string {
    return verificationStatus.error.errors[0].message;
  }

  private getTargetVerificationMethodContainer (): Issuer | IDidDocument {
    if (this.issuer.didDocument) {
      const verificationMethod = this.findVerificationMethod(
        this.issuer.didDocument.verificationMethod, this.issuer.didDocument.id);
      if (verificationMethod) {
        return this.issuer.didDocument;
      }
    }

    // let's assume the verification method is in the issuer profile and further checks will fail
    // if that's not the case
    const controller = {
      ...this.issuer
    };
    delete controller.didDocument; // not defined in JSONLD for verification
    return controller;
  }

  private findVerificationMethod (verificationMethods: IVerificationMethod[], controller: string): IVerificationMethod {
    return verificationMethods.find(
      verificationMethod => {
        return verificationMethod.id === this.proof.verificationMethod ||
          controller + verificationMethod.id === this.proof.verificationMethod;
      }) ?? null;
  }

  private getMultikeyRepresentation () {
    const multikey = {
      '@context': 'https://w3id.org/security/multikey/v1',
      type: 'Multikey',
      publicKeyMultibase: jwkToMultibaseEd25519(this.verificationMethod.publicKeyJwk),
      id: typeof this.verificationMethod.id === 'string' ? this.verificationMethod.id : undefined,
      controller: typeof this.verificationMethod.controller === 'string' ? this.verificationMethod.controller : undefined
    };
    return multikey
  }

  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    this.verificationKey = await this.executeStep(
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      async (): Promise<Ed25519VerificationKey2020> => {
        const issuerDoc = this.getTargetVerificationMethodContainer();
        if (!issuerDoc) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey,
            'The verification method of the document does not match the provided issuer.');
        }

        this.verificationMethod = this.findVerificationMethod(issuerDoc.verificationMethod, issuerDoc.id);

        if (!this.verificationMethod) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey,
            'The verification method of the document does not match the provided issuer.');
        }

        try {
          this.publicKey = this.verificationMethod.publicKeyMultibase ??
            await this.publicKeyJwkToString(this.verificationMethod);
        } catch (e) {
          console.error('ERROR retrieving Ed25519Signature2020 public key', e);
        }

        const key = await Ed25519Multikey.from({
          ...this.verificationMethod
        });

        if (!key) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, 'Could not derive the verification key');
        }

        if (key.revoked) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, 'The verification key has been revoked');
        }

        return key;
      },
      this.type
    );
  }

  private async ensureVerificationMethodValidity (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.ensureVerificationMethodValidity,
      async (): Promise<void> => {
        if (this.verificationMethod.expires) {
          const expirationDate = new Date(this.verificationMethod.expires).getTime();
          if (expirationDate < Date.now()) {
            throw new VerifierError(SUB_STEPS.ensureVerificationMethodValidity, 'The verification key has expired');
          }
        }

        if (this.verificationMethod.revoked) {
          // waiting on clarification https://github.com/w3c/cid/issues/152
          throw new VerifierError(SUB_STEPS.ensureVerificationMethodValidity, 'The verification key has been revoked');
        }
      },
      this.type
    );
  }

  private async checkDocumentSignature (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkDocumentSignature,
      async (): Promise<void> => {
        const suite = new DataIntegrityProof({cryptosuite: eddsaRdfc2022CryptoSuite});
        const verificationStatus = await jsigs.verify(this.documentToVerify, {
          suite,
          purpose: new this.proofPurposeMap[this.proofPurpose]({
            controller: this.getTargetVerificationMethodContainer(),
            challenge: this.challenge,
            domain: this.domain
          }),
          documentLoader: this.generateDocumentLoader()
        });

        if (!verificationStatus.verified) {
          console.error(JSON.stringify(verificationStatus, null, 2));
          throw new VerifierError(SUB_STEPS.checkDocumentSignature,
            `The document's ${this.type} signature could not be confirmed: ${this.getErrorMessage(verificationStatus)}`);
        } else {
          console.log('Credential EddsaRdfc2022 signature successfully verified');
        }
      },
      this.type
    );
  }
}
