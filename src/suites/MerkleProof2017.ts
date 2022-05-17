import * as inspectors from '../inspectors';
import domain from '../domain';
import { removeEntry } from '../helpers/array';
import { Suite } from '../models/Suite';
import type { Blockcerts } from '../models/Blockcerts';
import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { IBlockchainObject } from '../constants/blockchains';
import type { Receipt } from '../models/Receipt';
import type { Issuer, IssuerPublicKeyList } from '../models/Issuer';
import type { BlockcertsV2 } from '../models/BlockcertsV2';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';

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
  public type = 'MerkleProof2017';

  constructor (props: SuiteAPI) {
    super(props);
    if (props.actionMethod) {
      this._doAction = props.actionMethod;
    }
    this.documentToVerify = props.document;
    this.explorerAPIs = props.explorerAPIs;
    this.issuer = props.issuer;
    this.receipt = (this.documentToVerify as BlockcertsV2).signature;
    this.chain = domain.certificates.getChain('', this.receipt);
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.adaptVerificationProcessToChain();
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

  getChain (): IBlockchainObject {
    return this.chain;
  }

  getReceipt (): Receipt {
    return this.receipt;
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

  async _doAction (step: SUB_STEPS, action): Promise<any> {
    throw new Error('doAction method needs to be overwritten by injecting from CVJS');
  }

  private async getTransactionId (): Promise<void> {
    await this._doAction(
      SUB_STEPS.getTransactionId,
      () => inspectors.isTransactionIdValid(this.transactionId)
    );
  }

  private async computeLocalHash (): Promise<void> {
    this.localHash = await this._doAction(
      SUB_STEPS.computeLocalHash,
      async () => await inspectors.computeLocalHash(this.documentToVerify)
    );
  }

  private async fetchRemoteHash (): Promise<void> {
    this.txData = await this._doAction(
      SUB_STEPS.fetchRemoteHash,
      async () => await domain.verifier.lookForTx({
        transactionId: this.transactionId,
        chain: this.chain.code,
        explorerAPIs: this.explorerAPIs
      })
    );
  }

  private async compareHashes (): Promise<void> {
    await this._doAction(SUB_STEPS.compareHashes, () => {
      inspectors.ensureHashesEqual(this.localHash, this.receipt.targetHash);
    });
  }

  private async checkMerkleRoot (): Promise<void> {
    await this._doAction(SUB_STEPS.checkMerkleRoot, () =>
      inspectors.ensureMerkleRootEqual(this.receipt.merkleRoot, this.txData.remoteHash)
    );
  }

  private async checkReceipt (): Promise<void> {
    await this._doAction(SUB_STEPS.checkReceipt, () =>
      inspectors.ensureValidReceipt(this.receipt)
    );
  }

  private async parseIssuerKeys (): Promise<void> {
    this.issuerPublicKeyList = await this._doAction(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(this.issuer)
    );
  }

  private async checkAuthenticity (): Promise<void> {
    await this._doAction(SUB_STEPS.checkAuthenticity, () =>
      inspectors.ensureValidIssuingKey(this.issuerPublicKeyList, this.txData.issuingAddress, this.txData.time)
    );
  }
}
