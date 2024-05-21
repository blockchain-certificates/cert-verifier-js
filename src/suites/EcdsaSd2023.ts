import domain from '../domain';
import jsigs from 'jsonld-signatures';
import jsonld from 'jsonld';
import * as ecdsaSd2023Cryptosuite from '@digitalbazaar/ecdsa-sd-2023-cryptosuite';
import { Suite } from '../models/Suite';
import { preloadedContexts } from '../constants';
import { deepCopy } from '../helpers/object';
import type { Blockcerts } from '../models/Blockcerts';
import type { Issuer } from '../models/Issuer';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { IDidDocument } from '../models/DidDocument';

const { purposes: { AssertionProofPurpose } } = jsigs;
// const { createVerifyCryptosuite } = ecdsaSd2023Cryptosuite;

enum SUB_STEPS {
  // retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  checkDocumentSignature = 'checkDocumentSignature'
}

export default class EcdsaSd2023 extends Suite {
  public verificationProcess = [
    // SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.checkDocumentSignature
  ];

  public documentToVerify: Blockcerts;
  public issuer: Issuer;
  public proof: VCProof;
  public type = 'EcdsaSd2023';
  public cryptosuite = 'ecdsa-sd-2023';
  public publicKey: string;

  constructor (props: SuiteAPI) {
    super(props);
    if (props.executeStep) {
      this.executeStep = props.executeStep;
    }
    this.documentToVerify = props.document;
    this.issuer = props.issuer;
    this.proof = props.proof as VCProof;
    this.validateProofType();
    console.log('ecdsa sd', this.documentToVerify);
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

  private generateDocumentLoader (): any {
    preloadedContexts[(this.documentToVerify as BlockcertsV3).issuer as string] = this.getTargetVerificationMethodContainer();
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
      const initialProof = document.proof.find(p => p.type === this.type);
      delete document.proof;
      document.proof = initialProof;
    }
    return document;
  }

  private getTargetVerificationMethodContainer (): Issuer | IDidDocument {
    return this.issuer.didDocument ?? this.issuer;
  }

  private async checkDocumentSignature (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkDocumentSignature,
      async (): Promise<void> => {
        console.log('ecdsa sd checkDocumentSignature');
        // const suite = new Secp256k1VerificationSuite({ key: this.verificationKey });
        // // TODO: date property should exist but we are currently using a forked implementation which does not expose it
        // (suite as any).date = new Date(Date.now()).toISOString();
        //
        // const verificationStatus = await jsigs.verify(this.retrieveInitialDocument(), {
        //   suite,
        //   purpose: new AssertionProofPurpose(),
        //   documentLoader: this.generateDocumentLoader()
        // });
        //
        // if (!verificationStatus.verified) {
        //   console.error(JSON.stringify(verificationStatus, null, 2));
        //   throw new VerifierError(SUB_STEPS.checkDocumentSignature, `The document's ${this.type} signature could not be confirmed`);
        // } else {
        //   console.log('Credential Secp256k1 signature successfully verified');
        // }
      },
      this.type
    );
  }
}
