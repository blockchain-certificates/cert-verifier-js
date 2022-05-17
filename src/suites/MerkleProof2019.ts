import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import * as inspectors from '../inspectors';
import domain from '../domain';
import { getMerkleProof2019VerificationMethod } from '../models/MerkleProof2019';
import { Suite } from '../models/Suite';
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

export function parseReceipt (proof: VCProof | VCProof[]): Receipt {
  let merkleProof2019: VCProof;

  if (Array.isArray(proof)) {
    merkleProof2019 = proof.find(p => p.type === 'MerkleProof2019' || p.chainedProofType === 'MerkleProof2019');
  } else {
    merkleProof2019 = proof;
  }

  const base58Decoder = new Decoder(merkleProof2019.proofValue);
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
  public type = 'MerkleProof2019';

  constructor (props: SuiteAPI) {
    super(props);
    this._doAction = props.actionMethod;
    this.documentToVerify = props.document as BlockcertsV3;
    this.explorerAPIs = props.explorerAPIs;
    this.issuer = props.issuer;
    this.receipt = parseReceipt(this.documentToVerify.proof);
    this.chain = domain.certificates.getChain('', this.receipt);
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.hasDid = !!this.issuer.didDocument;
  }

  async verifyProof (): Promise<void> {
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

  private async verifyProcess (process: SUB_STEPS[]): Promise<void> {
    for (const verificationStep of process) {
      if (!this[verificationStep]) {
        console.error('verification logic for', verificationStep, 'not implemented');
        return;
      }
      await this[verificationStep]();
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

  // ##### DID CORRELATION #####

  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    await this._doAction(SUB_STEPS.retrieveVerificationMethodPublicKey, () => {
      this.verificationMethodPublicKey = inspectors
        .retrieveVerificationMethodPublicKey(
          this.issuer.didDocument,
          getMerkleProof2019VerificationMethod(this.documentToVerify)
        );
    });
  }

  // merkle proof 2019
  private async deriveIssuingAddressFromPublicKey (): Promise<void> {
    await this._doAction(SUB_STEPS.deriveIssuingAddressFromPublicKey, () => {
      this.derivedIssuingAddress = inspectors.deriveIssuingAddressFromPublicKey(this.verificationMethodPublicKey, this.chain);
    });
  }

  // merkle proof 2019
  private async compareIssuingAddress (): Promise<void> {
    await this._doAction(SUB_STEPS.compareIssuingAddress, () => {
      inspectors.compareIssuingAddress(this.txData.issuingAddress, this.derivedIssuingAddress);
    });
  }
}
