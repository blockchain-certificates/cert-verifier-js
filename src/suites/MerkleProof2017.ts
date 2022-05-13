import * as inspectors from '../inspectors';
import domain from '../domain';
import type { Blockcerts } from '../models/Blockcerts';
import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { IBlockchainObject } from '../constants/blockchains';
import type { Receipt } from '../models/Receipt';
import type Versions from '../constants/certificateVersions';
import type { Issuer, IssuerPublicKeyList } from '../models/Issuer';
import type { IVerificationSubstep } from '../constants/verificationSteps';
import { getText } from '../domain/i18n/useCases';

function removeStep (map: string[], step: string): void {
  const stepIndex = map.findIndex(subStep => subStep === step);
  if (stepIndex > -1) {
    map.splice(stepIndex, 1);
  }
}

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

export default class MerkleProof2017 {
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
  public version: Versions; // Version can be ignored in MerkleProof2019
  public issuerPublicKeyList: IssuerPublicKeyList;
  public issuer: Issuer;

  constructor ({
    actionMethod = null,
    document = null,
    transactionId = '',
    chain = null,
    explorerAPIs = null,
    receipt = null,
    version = null,
    issuer = null
  }) {
    if (actionMethod) {
      this._doAction = actionMethod;
    }
    this.transactionId = transactionId;
    this.documentToVerify = document;
    this.chain = chain;
    this.explorerAPIs = explorerAPIs;
    this.receipt = receipt;
    this.version = version;
    this.issuer = issuer;
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

  getProofVerificationSteps (parentStepKey): IVerificationSubstep[] {
    return this.verificationProcess.map(childStep => ({
      code: childStep,
      label: getText('subSteps', `${childStep}Label`),
      labelPending: getText('subSteps', `${childStep}LabelPending`),
      parentStep: parentStepKey
    }));
  }

  getIdentityVerificationSteps (): IVerificationSubstep[] {
    return [];
  }

  private adaptVerificationProcessToChain (): void {
    if (domain.chains.isMockChain(this.chain)) {
      removeStep(this.verificationProcess, SUB_STEPS.getTransactionId);
      removeStep(this.verificationProcess, SUB_STEPS.fetchRemoteHash);
      removeStep(this.verificationProcess, SUB_STEPS.parseIssuerKeys);
      removeStep(this.verificationProcess, SUB_STEPS.checkMerkleRoot);
      removeStep(this.verificationProcess, SUB_STEPS.checkAuthenticity);
    }
  }

  private async _doAction (step: SUB_STEPS, action): Promise<any> {
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
      inspectors.ensureValidReceipt(this.receipt, this.version)
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
