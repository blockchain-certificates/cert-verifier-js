import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import * as inspectors from '../inspectors';
import domain from '../domain';
import { Suite } from '../models/Suite';
import { isDidUri } from '../domain/verifier/useCases/getIssuerProfile';
import { getVCProofVerificationMethod } from '../models/BlockcertsV3';
import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import type { IBlockchainObject } from '../constants/blockchains';
import type { Receipt } from '../models/Receipt';
import type { Issuer, IssuerPublicKeyList } from '../models/Issuer';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';

enum SUB_STEPS {
  getTransactionId = 'getTransactionId',
  computeLocalHash = 'computeLocalHash',
  fetchRemoteHash = 'fetchRemoteHash',
  parseIssuerKeys = 'parseIssuerKeys',
  compareHashes = 'compareHashes',
  checkImagesIntegrity = 'checkImagesIntegrity',
  checkMerkleRoot = 'checkMerkleRoot',
  checkReceipt = 'checkReceipt',
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  deriveIssuingAddressFromPublicKey = 'deriveIssuingAddressFromPublicKey',
  compareIssuingAddress = 'compareIssuingAddress',
  checkAuthenticity = 'checkAuthenticity'
}

export function parseReceipt (proof: VCProof): Receipt {
  const base58Decoder = new Decoder(proof.proofValue);
  return base58Decoder.decode();
}

export default class MerkleProof2019 extends Suite {
  public proofVerificationProcess = [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.checkAuthenticity
  ];

  public identityVerificationProcess = [
    SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.deriveIssuingAddressFromPublicKey,
    SUB_STEPS.compareIssuingAddress
  ];

  public transactionId: string;
  public localHash: string;
  public documentToVerify: BlockcertsV3;
  public txData: TransactionData;
  public chain: IBlockchainObject;
  public explorerAPIs: ExplorerAPI[];
  public receipt: Receipt;
  public issuerPublicKeyList: IssuerPublicKeyList;
  public issuer: Issuer;
  public verificationMethodPublicKey: IDidDocumentPublicKey;
  public derivedIssuingAddress: string;
  public hasDid: boolean;
  public proof: VCProof;
  public type = 'MerkleProof2019';

  constructor (props: SuiteAPI) {
    super(props);
    this._doAction = props.actionMethod;
    this.documentToVerify = props.document as BlockcertsV3;
    this.explorerAPIs = props.explorerAPIs;
    this.proof = props.proof as VCProof;
    this.issuer = props.issuer;
    this.validateProofType();
    this.receipt = parseReceipt(this.proof);
    this.chain = domain.certificates.getChain('', this.receipt);
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.setHasDid();
  }

  async verifyProof (): Promise<void> {
    await this.setIssuerFromProofVerificationMethod();
    await this.verifyProcess(this.proofVerificationProcess);
  }

  async verifyIdentity (): Promise<void> {
    if (this.hasDid) {
      await this.verifyProcess(this.identityVerificationProcess);
    }
  }

  getProofVerificationSteps (parentStepKey): VerificationSubstep[] {
    return this.proofVerificationProcess.map(childStepKey =>
      domain.verifier.convertToVerificationSubsteps(parentStepKey, childStepKey)
    );
  }

  getIdentityVerificationSteps (parentStepKey): VerificationSubstep[] {
    if (!this.hasDid) {
      return [];
    }
    return this.identityVerificationProcess.map(childStepKey =>
      domain.verifier.convertToVerificationSubsteps(parentStepKey, childStepKey)
    );
  }

  getIssuerPublicKey (): string {
    if (!this.txData) {
      console.error('Trying to access issuing address when txData not available yet. Did you run the `verify` method yet?');
    }
    return this.txData.issuingAddress;
  }

  getChain (): IBlockchainObject {
    return this.chain;
  }

  getReceipt (): Receipt {
    return this.receipt;
  }

  private isProofChain (): boolean {
    return this.proof.type === 'ChainedProof2021';
  }

  private async setIssuerFromProofVerificationMethod (): Promise<void> {
    if (this.isProofChain()) {
      const issuerProfileUrl = this.proof.verificationMethod.split('#')[0];
      this.issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
    }
  }

  private setHasDid (): void {
    if (this.isProofChain()) {
      const issuerProfileUrl = this.proof.verificationMethod.split('#')[0];
      this.hasDid = isDidUri(issuerProfileUrl);
      return;
    }
    this.hasDid = !!this.issuer.didDocument;
  }

  private validateProofType (): void {
    const proofType = this.isProofChain() ? this.proof.chainedProofType : this.proof.type;
    if (proofType !== this.type) {
      throw new Error(`Incompatible proof type passed. Expected: ${this.type}, Got: ${proofType}`);
    }
  }

  private async verifyProcess (process: SUB_STEPS[]): Promise<void> {
    for (const verificationStep of process) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
    }
  }

  async _doAction (step: SUB_STEPS, action, verificationSuite: string): Promise<any> {
    throw new Error('doAction method needs to be overwritten by injecting from CVJS');
  }

  private async getTransactionId (): Promise<void> {
    await this._doAction(
      SUB_STEPS.getTransactionId,
      () => inspectors.isTransactionIdValid(this.transactionId),
      this.type
    );
  }

  private async computeLocalHash (): Promise<void> {
    this.localHash = await this._doAction(
      SUB_STEPS.computeLocalHash,
      async () => await inspectors.computeLocalHash(this.documentToVerify),
      this.type
    );
  }

  private async fetchRemoteHash (): Promise<void> {
    this.txData = await this._doAction(
      SUB_STEPS.fetchRemoteHash,
      async () => await domain.verifier.lookForTx({
        transactionId: this.transactionId,
        chain: this.chain.code,
        explorerAPIs: this.explorerAPIs
      }),
      this.type
    );
  }

  private async compareHashes (): Promise<void> {
    await this._doAction(
      SUB_STEPS.compareHashes,
      () => inspectors.ensureHashesEqual(this.localHash, this.receipt.targetHash),
      this.type
    );
  }

  private async checkMerkleRoot (): Promise<void> {
    await this._doAction(
      SUB_STEPS.checkMerkleRoot,
      () => inspectors.ensureMerkleRootEqual(this.receipt.merkleRoot, this.txData.remoteHash),
      this.type
    );
  }

  private async checkReceipt (): Promise<void> {
    await this._doAction(
      SUB_STEPS.checkReceipt,
      () => inspectors.ensureValidReceipt(this.receipt),
      this.type
    );
  }

  private async parseIssuerKeys (): Promise<void> {
    this.issuerPublicKeyList = await this._doAction(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(this.issuer),
      this.type
    );
  }

  private async checkAuthenticity (): Promise<void> {
    await this._doAction(
      SUB_STEPS.checkAuthenticity,
      () => inspectors.ensureValidIssuingKey(this.issuerPublicKeyList, this.txData.issuingAddress, this.txData.time),
      this.type
    );
  }

  // ##### DID CORRELATION #####
  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    this.verificationMethodPublicKey = await this._doAction(
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      () => inspectors
        .retrieveVerificationMethodPublicKey(
          this.issuer.didDocument,
          getVCProofVerificationMethod(this.proof)
        ),
      this.type
    );
  }

  private async deriveIssuingAddressFromPublicKey (): Promise<void> {
    this.derivedIssuingAddress = await this._doAction(
      SUB_STEPS.deriveIssuingAddressFromPublicKey,
      () => inspectors.deriveIssuingAddressFromPublicKey(this.verificationMethodPublicKey, this.chain),
      this.type
    );
  }

  private async compareIssuingAddress (): Promise<void> {
    await this._doAction(
      SUB_STEPS.compareIssuingAddress,
      () => inspectors.compareIssuingAddress(this.txData.issuingAddress, this.derivedIssuingAddress),
      this.type
    );
  }
}
