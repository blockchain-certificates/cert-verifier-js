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
  retrieveVerificationKey = 'retrieveVerificationKey',
  checkDocumentStatus = 'checkDocumentStatus'
}

export default class Ed25519Signature2020 extends Suite {
  public verificationProcess = [
    SUB_STEPS.retrieveVerificationKey,
    SUB_STEPS.checkDocumentStatus
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
    return this.verificationProcess.map(childStepKey =>
      domain.verifier.convertToVerificationSubsteps(parentStepKey, childStepKey)
    );
  }

  getIdentityVerificationSteps (): VerificationSubstep[] {
    return [];
  }

  getIssuerPublicKey (): string {
    return 'not implemented';
  }

  async _doAction (step: string, action): Promise<any> {
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
    preloadedContexts[(this.documentToVerify as BlockcertsV3).issuer] = this.issuer.didDocument;
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

  private async retrieveVerificationKey (): Promise<void> {
    this.verificationKey = await this._doAction(
      SUB_STEPS.retrieveVerificationKey,
      async () => {
        const verificationMethod = this.issuer.didDocument.verificationMethod
          .find(verificationMethod => verificationMethod.id === this.proof.verificationMethod);

        if (!verificationMethod) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationKey,
            'The verification method of the document does not match the provided issuer.');
        }

        const key = await Ed25519VerificationKey2020.from({
          ...verificationMethod
        });

        if (!key) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationKey, 'Could not derive the verification key');
        }

        if (key.revoked) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationKey, 'The verification key has been revoked');
        }

        return key;
      }
    );
  }

  private async checkDocumentStatus (): Promise<void> {
    console.log('checkDocumentStatus with key', this.verificationKey);
    const suite = new Ed25519VerificationSuite({ key: this.verificationKey });
    suite.date = new Date(Date.now()).toISOString();

    const verificationStatus = await jsigs.verify(this.retrieveInitialDocument(), {
      suite,
      purpose: new AssertionProofPurpose(),
      documentLoader: this.generateDocumentLoader()
    });

    if (!verificationStatus.verified) {
      console.error(JSON.stringify(verificationStatus, null, 2));
      throw new Error('Error validating the revocation list credential proof');
    } else {
      console.log('Credential Ed25519 signature successfully verified');
    }
  }
}
