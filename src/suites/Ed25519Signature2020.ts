import domain from '../domain';
import jsigs from 'jsonld-signatures';
import jsonld from 'jsonld';
// @ts-expect-error: not a typescript package
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
// @ts-expect-error: not a typescript package
import { Ed25519Signature2020 as Ed25519VerificationSuite } from '@digitalbazaar/ed25519-signature-2020';
import { Ed25519KeyPair } from '@transmute/ed25519-key-pair';
import { Suite } from '../models/Suite';
import { VerifierError } from '../models';
import { preloadedContexts } from '../constants';
import { deepCopy } from '../helpers/object';
import type { Blockcerts } from '../models/Blockcerts';
import type { Issuer } from '../models/Issuer';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { IDidDocument } from '../models/DidDocument';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

const { purposes: { AssertionProofPurpose, AuthenticationProofPurpose } } = jsigs;

enum SUB_STEPS {
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  checkDocumentSignature = 'checkDocumentSignature'
}

export default class Ed25519Signature2020 extends Suite {
  public verificationProcess = [
    SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.checkDocumentSignature
  ];

  public documentToVerify: Blockcerts;
  public issuer: Issuer;
  public proof: VCProof;
  public type = 'Ed25519Signature2020';
  public verificationKey: Ed25519VerificationKey2020;
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    if (proofType !== this.type) {
      throw new Error(`Incompatible proof type passed. Expected: ${this.type}, Got: ${proofType}`);
    }
  }

  private isProofChain (): boolean {
    return this.proof.type === 'ChainedProof2021';
  }

  private generateDocumentLoader (): any {
    preloadedContexts[(this.documentToVerify as BlockcertsV3).issuer as string] = this.issuer.didDocument;
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

  private retrieveInitialDocument (): BlockcertsV3 {
    const document: BlockcertsV3 = deepCopy<BlockcertsV3>(this.documentToVerify as BlockcertsV3);
    if (Array.isArray(document.proof)) {
      // TODO: handle case when ed25519 proof is chained
      const initialProof = document.proof.find(p => p.type === this.type);
      delete document.proof;
      document.proof = initialProof;
    }
    // when the document to verify is an issuer profile and it was brought up by a DID
    // the didDocument gets appended. However it is not part of the initial document
    delete (document as any).didDocument;

    return document;
  }

  private getTargetVerificationMethodContainer (): Issuer | IDidDocument {
    if (this.issuer.didDocument) {
      const verificationMethod = this.findVerificationMethod(this.issuer.didDocument.verificationMethod);
      if (verificationMethod) {
        return this.issuer.didDocument;
      }
    }

    const verificationMethod = this.findVerificationMethod(this.issuer.verificationMethod);
    if (verificationMethod) {
      const controller = {
        ...this.issuer
      };
      delete controller.didDocument; // not defined in JSONLD for verification
      return controller;
    }

    return null;
  }

  private findVerificationMethod (verificationMethods: IDidDocumentPublicKey[]): IDidDocumentPublicKey {
    return verificationMethods.find(
      verificationMethod => verificationMethod.id === this.proof.verificationMethod) ?? null;
  }

  private getErrorMessage (verificationStatus): string {
    return verificationStatus.error.errors[0].message;
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

        const verificationMethod = this.findVerificationMethod(issuerDoc.verificationMethod);

        if (!verificationMethod) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey,
            'The verification method of the document does not match the provided issuer.');
        }

        try {
          this.publicKey = verificationMethod.publicKeyMultibase ??
            await this.publicKeyJwkToString(verificationMethod);
        } catch (e) {
          console.error('ERROR retrieving Ed25519Signature2020 public key', e);
        }

        const key = await Ed25519VerificationKey2020.from({
          ...verificationMethod
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

  private async checkDocumentSignature (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkDocumentSignature,
      async (): Promise<void> => {
        const suite = new Ed25519VerificationSuite({ key: this.verificationKey });
        suite.date = new Date(Date.now()).toISOString();

        if (this.proofPurpose === 'authentication' && !this.proof.challenge) {
          this.proof.challenge = '';
        }

        const verificationStatus = await jsigs.verify(this.retrieveInitialDocument(), {
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
          console.log('Credential Ed25519 signature successfully verified');
        }
      },
      this.type
    );
  }
}
