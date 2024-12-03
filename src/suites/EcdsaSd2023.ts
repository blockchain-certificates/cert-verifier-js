import domain from '../domain';
import jsigs from 'jsonld-signatures';
import jsonld from 'jsonld';
// @ts-expect-error: not a typescript package
import { createVerifyCryptosuite } from '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
// @ts-expect-error: not a typescript package
import { DataIntegrityProof } from '@digitalbazaar/data-integrity';
import { Suite } from '../models/Suite';
import { preloadedContexts } from '../constants';
import * as inspectors from '../inspectors';
import type { Issuer } from '../models/Issuer';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { IDidDocument } from '../models/DidDocument';
import { VerifierError } from '../models';

const { purposes: { AssertionProofPurpose, AuthenticationProofPurpose } } = jsigs;

enum SUB_STEPS {
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  checkDocumentSignature = 'checkDocumentSignature'
}

export default class EcdsaSd2023 extends Suite {
  public verificationProcess = [
    SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.checkDocumentSignature
  ];

  public documentToVerify: BlockcertsV3;
  public issuer: Issuer;
  public proof: VCProof;
  public type = 'EcdsaSd2023';
  public cryptosuite = 'ecdsa-sd-2023';
  public publicKey: string;
  public verificationKey: any;
  public proofPurpose: string;
  private readonly proofPurposeMap: any;

  constructor (props: SuiteAPI) {
    super(props);
    if (props.executeStep) {
      this.executeStep = props.executeStep;
    }
    this.documentToVerify = props.document as BlockcertsV3;
    this.issuer = props.issuer;
    this.proof = props.proof as VCProof;
    this.proofPurpose = props.proofPurpose ?? 'assertionMethod';
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

  private validateProofType (): void {
    const proofType = this.proof.type;
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

  private generateDocumentLoader (documents: Array<{ url: string; value: string }> = []): any {
    documents.forEach(document => {
      preloadedContexts[document.url] = document.value;
    });
    preloadedContexts[this.documentToVerify.issuer as string] = this.getTargetVerificationMethodContainer();
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
    return verificationStatus.results[0].error.cause.message;
  }

  private getTargetVerificationMethodContainer (): Issuer | IDidDocument {
    return this.issuer.didDocument ?? this.issuer;
  }

  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    this.verificationKey = await this.executeStep(
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      async (): Promise<any> => {
        const verificationMethodPublicKey = inspectors.retrieveVerificationMethodPublicKey(
          this.getTargetVerificationMethodContainer(),
          this.proof.verificationMethod
        );

        if (!verificationMethodPublicKey) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, 'Could not derive the verification key');
        }

        // TODO: revoked property should exist but we are currently using a forked implementation which does not expose it
        if ((verificationMethodPublicKey as any).revoked) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, 'The verification key has been revoked');
        }

        return verificationMethodPublicKey;
      },
      this.type
    );
  }

  private async checkDocumentSignature (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkDocumentSignature,
      async (): Promise<void> => {
        const suite = new DataIntegrityProof({
          cryptosuite: createVerifyCryptosuite({ requiredAlgorithm: 'K-256' })
        });
        const verificationMethod = (this.documentToVerify.proof as VCProof).verificationMethod;
        const verificationStatus = await jsigs.verify(this.documentToVerify, {
          suite,
          // TODO: uncomment the following if jsonld-signatures follows the spec https://github.com/digitalbazaar/jsonld-signatures/issues/185
          // purpose: new this.proofPurposeMap[this.proofPurpose](),
          purpose: new AssertionProofPurpose(),
          documentLoader: this.generateDocumentLoader([
            {
              url: verificationMethod,
              value: this.verificationKey
            }
          ])
        });

        if (!verificationStatus.verified) {
          console.error(JSON.stringify(verificationStatus, null, 2));
          throw new VerifierError(SUB_STEPS.checkDocumentSignature,
            `The document's ${this.type} signature could not be confirmed: ${this.getErrorMessage(verificationStatus)}`);
        } else {
          console.log(`Credential ${this.type} signature successfully verified`);
        }
      },
      this.type
    );
  }
}
