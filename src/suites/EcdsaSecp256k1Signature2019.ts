import domain from '../domain';
import jsigs from 'jsonld-signatures';
import jsonld from 'jsonld';
import { EcdsaSecp256k1VerificationKey2019 } from '@bloomprotocol/ecdsa-secp256k1-verification-key-2019';
import { EcdsaSecp256k1Signature2019 as Secp256k1VerificationSuite } from '@bloomprotocol/ecdsa-secp256k1-signature-2019';
import { Suite } from '../models/Suite';
import { VerifierError } from '../models';
import { preloadedContexts } from '../constants';
import { deepCopy } from '../helpers/object';
import { publicKeyBase58FromPublicKeyHex, publicKeyHexFromJwk } from '../helpers/keyUtils';
import * as inspectors from '../inspectors';
import type { Blockcerts } from '../models/Blockcerts';
import type { Issuer } from '../models/Issuer';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { ISecp256k1PublicKeyJwk } from '../helpers/keyUtils';
import type { IDidDocument } from '../models/DidDocument';

const { purposes: { AssertionProofPurpose } } = jsigs;

enum SUB_STEPS {
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  checkDocumentSignature = 'checkDocumentSignature'
}

export default class EcdsaSecp256k1Signature2019 extends Suite {
  public verificationProcess = [
    SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.checkDocumentSignature
  ];

  public documentToVerify: Blockcerts;
  public issuer: Issuer;
  public proof: VCProof;
  public type = 'EcdsaSecp256k1Signature2019';
  public verificationKey: EcdsaSecp256k1VerificationKey2019;
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
    const proofType = this.isProofChain() ? this.proof.chainedProofType : this.proof.type;
    if (proofType !== this.type) {
      throw new Error(`Incompatible proof type passed. Expected: ${this.type}, Got: ${proofType}`);
    }
  }

  private isProofChain (): boolean {
    return this.proof.type === 'ChainedProof2021';
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
      // TODO: handle case when secp256k1 proof is chained
      const initialProof = document.proof.find(p => p.type === this.type);
      delete document.proof;
      document.proof = initialProof;
    }
    return document;
  }

  private getTargetVerificationMethodContainer (): Issuer | IDidDocument {
    return this.issuer.didDocument ?? this.issuer;
  }

  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    this.verificationKey = await this.executeStep(
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      async (): Promise<EcdsaSecp256k1VerificationKey2019> => {
        const verificationMethod = await inspectors.retrieveVerificationMethodPublicKey(
          this.getTargetVerificationMethodContainer(),
          this.proof.verificationMethod
        );

        if (verificationMethod.publicKeyJwk && !verificationMethod.publicKeyBase58) {
          const hexKey = publicKeyHexFromJwk(verificationMethod.publicKeyJwk as ISecp256k1PublicKeyJwk);
          verificationMethod.publicKeyBase58 = publicKeyBase58FromPublicKeyHex(hexKey);
        }
        this.publicKey = verificationMethod.publicKeyBase58;

        const key = await EcdsaSecp256k1VerificationKey2019.from({
          ...verificationMethod
        });

        if (!key) {
          throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, 'Could not derive the verification key');
        }

        // TODO: revoked property should exist but we are currently using a forked implementation which does not expose it
        if ((key as any).revoked) {
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
        const suite = new Secp256k1VerificationSuite({ key: this.verificationKey });
        // TODO: date property should exist but we are currently using a forked implementation which does not expose it
        (suite as any).date = new Date(Date.now()).toISOString();

        const verificationStatus = await jsigs.verify(this.retrieveInitialDocument(), {
          suite,
          purpose: new AssertionProofPurpose(),
          documentLoader: this.generateDocumentLoader()
        });

        if (!verificationStatus.verified) {
          console.error(JSON.stringify(verificationStatus, null, 2));
          throw new VerifierError(SUB_STEPS.checkDocumentSignature, `The document's ${this.type} signature could not be confirmed`);
        } else {
          console.log('Credential Secp256k1 signature successfully verified');
        }
      },
      this.type
    );
  }
}
