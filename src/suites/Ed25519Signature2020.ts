import domain from '../domain';
import jsigs from 'jsonld-signatures';
import jsonld from 'jsonld';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 as Ed25519VerificationSuite } from '@digitalbazaar/ed25519-signature-2020';
import { Suite } from '../models/Suite';
import type { Blockcerts } from '../models/Blockcerts';
import type { Issuer } from '../models/Issuer';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import { VerifierError } from '../models';
import { preloadedContexts } from '../constants';
import { deepCopy } from '../helpers/object';

const { purposes: { AssertionProofPurpose } } = jsigs;

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

  constructor (props: SuiteAPI) {
    super(props);
    if (props.actionMethod) {
      this._doAction = props.actionMethod;
    }
    this.documentToVerify = props.document;
    this.issuer = props.issuer;
    this.proof = props.proof as VCProof;
    this.validateProofType();
  }

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
    const { verificationMethod } = this.proof;
    const didDocument = this.issuer.didDocument;

    // TODO: handle case when not dealing with a didDocument
    const publicKey = didDocument.verificationMethod.find(vm => vm.id === verificationMethod);
    // TODO: this might not always be this property
    return publicKey.publicKeyMultibase;
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

  async _doAction (step: string, action, verificationSuite: string): Promise<any> {
    throw new Error('doAction method needs to be overwritten by injecting from CVJS');
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
    return document;
  }

  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    this.verificationKey = await this._doAction(
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      async (): Promise<Ed25519VerificationKey2020> => {
        const verificationMethod = this.issuer.didDocument.verificationMethod
          .find(verificationMethod => verificationMethod.id === this.proof.verificationMethod);

        if (!verificationMethod) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey,
            'The verification method of the document does not match the provided issuer.');
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
    await this._doAction(
      SUB_STEPS.checkDocumentSignature,
      async (): Promise<void> => {
        const suite = new Ed25519VerificationSuite({ key: this.verificationKey });
        suite.date = new Date(Date.now()).toISOString();

        const verificationStatus = await jsigs.verify(this.retrieveInitialDocument(), {
          suite,
          purpose: new AssertionProofPurpose(),
          documentLoader: this.generateDocumentLoader()
        });

        if (!verificationStatus.verified) {
          console.error(JSON.stringify(verificationStatus, null, 2));
          throw new VerifierError(SUB_STEPS.checkDocumentSignature, `The document's ${this.type} signature could not be confirmed`);
        } else {
          console.log('Credential Ed25519 signature successfully verified');
        }
      },
      this.type
    );
  }
}
