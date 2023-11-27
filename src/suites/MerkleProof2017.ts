import * as inspectors from '../inspectors';
import domain from '../domain';
import { removeEntry } from '../helpers/array';
import { Suite } from '../models/Suite';
import type { Blockcerts } from '../models/Blockcerts';
import type { ExplorerAPI, TransactionData, IBlockchainObject } from '@blockcerts/explorer-lookup';
import type { Receipt } from '../models/Receipt';
import type { Issuer, IssuerPublicKeyList } from '../models/Issuer';
import type { BlockcertsV2 } from '../models/BlockcertsV2';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';
import type { MerkleProof2017 as TMerkleProof2017 } from '../models/MerkleProof2017';
import type { ITransactionLink } from '../domain/certificates/useCases/getTransactionLink';

enum SUB_STEPS {
  getTransactionId = 'getTransactionId',
  computeLocalHash = 'computeLocalHash',
  fetchRemoteHash = 'fetchRemoteHash',
  parseIssuerKeys = 'parseIssuerKeys',
  compareHashes = 'compareHashes',
  checkMerkleRoot = 'checkMerkleRoot',
  checkReceipt = 'checkReceipt',
  checkAuthenticity = 'checkAuthenticity'
}

export default class MerkleProof2017 extends Suite {
  public verificationProcess = [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.checkAuthenticity
  ];

  public transactionId: string;
  public localHash: string;
  public documentToVerify: Blockcerts;
  public txData: TransactionData;
  public chain: IBlockchainObject;
  public explorerAPIs: ExplorerAPI[];
  public receipt: Receipt;
  public issuerPublicKeyList: IssuerPublicKeyList;
  public issuer: Issuer;
  public proof: TMerkleProof2017;
  public type = 'MerkleProof2017';

  constructor (props: SuiteAPI) {
    super(props);
    if (props.executeStep) {
      this.executeStep = props.executeStep;
    }
    this.documentToVerify = props.document;
    this.explorerAPIs = props.explorerAPIs;
    this.issuer = props.issuer;
    this.proof = props.proof as TMerkleProof2017;
    this.validateProofType();
    this.receipt = (this.documentToVerify as BlockcertsV2).signature ?? this.documentToVerify.receipt;
    this.chain = domain.certificates.getChain('', this.receipt);
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.adaptVerificationProcessToChain();
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
    if (domain.chains.isMockChain(this.chain)) {
      return 'This mock chain does not support issuing addresses';
    }
    if (!this.txData) {
      console.error('Trying to access issuing address when txData not available yet. Did you run the `verify` method yet?');
      return;
    }
    return this.txData.issuingAddress;
  }

  getIssuerName (): string {
    return this.issuer.name;
  }

  getIssuerProfileDomain (): string {
    const issuerProfileUrl = new URL(this.getIssuerProfileUrl());
    return issuerProfileUrl?.hostname;
  }

  getIssuerProfileUrl (): string {
    return this.issuer.id;
  }

  getSigningDate (): string {
    return this.txData.time.toString();
  }

  getProofType (): string {
    return Array.isArray(this.proof.type) ? this.proof.type[0] : this.proof.type;
  }

  getChain (): IBlockchainObject {
    return this.chain;
  }

  getReceipt (): Receipt {
    return this.receipt;
  }

  // TODO: rename inspector method to make this function `getTransactionId`
  getTransactionIdString (): string {
    return domain.certificates.getTransactionId(this.getReceipt());
  }

  getTransactionLink (): string {
    const transactionLinks: ITransactionLink = domain.certificates.getTransactionLink(this.getTransactionIdString(), this.getChain());
    return transactionLinks.transactionLink;
  }

  getRawTransactionLink (): string {
    const transactionLinks: ITransactionLink = domain.certificates.getTransactionLink(this.getTransactionIdString(), this.getChain());
    return transactionLinks.rawTransactionLink;
  }

  private validateProofType (): void {
    const validTypes = [this.type, 'ChainpointSHA256v2'];
    const proofType = this.getProofType();
    if (!validTypes.includes(proofType)) {
      throw new Error(`Incompatible proof type passed. Expected: ${this.type}, Got: ${this.proof.type[0]}`);
    }
  }

  private adaptVerificationProcessToChain (): void {
    if (domain.chains.isMockChain(this.chain)) {
      removeEntry(this.verificationProcess, SUB_STEPS.getTransactionId);
      removeEntry(this.verificationProcess, SUB_STEPS.fetchRemoteHash);
      removeEntry(this.verificationProcess, SUB_STEPS.parseIssuerKeys);
      removeEntry(this.verificationProcess, SUB_STEPS.checkMerkleRoot);
      removeEntry(this.verificationProcess, SUB_STEPS.checkAuthenticity);
    }
  }

  async executeStep (step: SUB_STEPS, action, verificationSuite: string): Promise<any> {
    throw new Error('doAction method needs to be overwritten by injecting from CVJS');
  }

  private async getTransactionId (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.getTransactionId,
      () => inspectors.isTransactionIdValid(this.transactionId),
      this.type
    );
  }

  private async computeLocalHash (): Promise<void> {
    this.localHash = await this.executeStep(
      SUB_STEPS.computeLocalHash,
      async () => await inspectors.computeLocalHash(this.documentToVerify),
      this.type
    );
  }

  private async fetchRemoteHash (): Promise<void> {
    this.txData = await this.executeStep(
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
    await this.executeStep(
      SUB_STEPS.compareHashes,
      () => inspectors.ensureHashesEqual(this.localHash, this.receipt.targetHash),
      this.type
    );
  }

  private async checkMerkleRoot (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkMerkleRoot,
      () => inspectors.ensureMerkleRootEqual(this.receipt.merkleRoot, this.txData.remoteHash),
      this.type
    );
  }

  private async checkReceipt (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkReceipt,
      () => { inspectors.ensureValidReceipt(this.receipt); },
      this.type
    );
  }

  private async parseIssuerKeys (): Promise<void> {
    this.issuerPublicKeyList = await this.executeStep(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(this.issuer),
      this.type
    );
  }

  private async checkAuthenticity (): Promise<void> {
    await this.executeStep(
      SUB_STEPS.checkAuthenticity,
      () => { inspectors.ensureValidIssuingKey(this.issuerPublicKeyList, this.txData.issuingAddress, this.txData.time); },
      this.type
    );
  }
}
