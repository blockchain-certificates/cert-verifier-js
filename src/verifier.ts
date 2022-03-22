import type { ExplorerAPI, TransactionData } from '@blockcerts/explorer-lookup';
import type { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import debug from 'debug';
import { VERIFICATION_STATUSES } from './constants/verificationStatuses';
import Versions from './constants/certificateVersions';
import domain from './domain';
import * as inspectors from './inspectors';
import type { Blockcerts } from './models/Blockcerts';
import type { IBlockchainObject } from './constants/blockchains';
import type { Issuer, IssuerPublicKeyList } from './models/Issuer';
import { VerificationSteps } from './constants/verificationSteps';
import { SUB_STEPS } from './constants/verificationSubSteps';
import type { IVerificationMapItem } from './domain/certificates/useCases/getVerificationMap';
import type { Receipt } from './models/Receipt';
import type { MerkleProof2019 } from './models/MerkleProof2019';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { VerifierError } from './models';
import { getText } from './domain/i18n/useCases';

const log = debug('Verifier');

export interface IVerificationStepCallbackAPI {
  code: string;
  label: string;
  status: string; // TODO: use enum
  errorMessage?: string;
}

export type IVerificationStepCallbackFn = (update: IVerificationStepCallbackAPI) => any;

export interface IFinalVerificationStatus {
  code: VerificationSteps.final;
  status: string; // TODO: use enum
  message: string;
}

export default class Verifier {
  public chain: IBlockchainObject;
  public expires: string;
  public id: string;
  public issuer: Issuer;
  public receipt: Receipt;
  public proof?: MerkleProof2019;
  public revocationKey: string;
  public version: Versions;
  public transactionId: string;
  public documentToVerify: Blockcerts;
  public explorerAPIs: ExplorerAPI[];
  public txData: TransactionData;
  private _stepsStatuses: any[]; // TODO: define stepStatus interface
  private readonly hashlinkVerifier: HashlinkVerifier;
  private localHash: string;
  private issuerPublicKeyList: IssuerPublicKeyList;
  private verificationMethodPublicKey: IDidDocumentPublicKey;
  private derivedIssuingAddress: string;
  public verificationSteps: IVerificationMapItem[];
  readonly verificationProcess: SUB_STEPS[];

  constructor (
    { certificateJson, chain, expires, hashlinkVerifier, id, issuer, receipt, revocationKey, transactionId, version, explorerAPIs, proof }: {
      certificateJson: Blockcerts;
      chain: IBlockchainObject;
      expires: string;
      id: string;
      issuer: Issuer;
      hashlinkVerifier: HashlinkVerifier;
      receipt: Receipt;
      revocationKey: string;
      transactionId: string;
      version: Versions;
      explorerAPIs?: ExplorerAPI[];
      proof?: MerkleProof2019;
    }
  ) {
    this.chain = chain;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.hashlinkVerifier = hashlinkVerifier;
    this.receipt = receipt;
    this.revocationKey = revocationKey;
    this.version = version;
    this.transactionId = transactionId;
    this.explorerAPIs = explorerAPIs;
    this.proof = proof;
    // Get the full verification step-by-step map
    this.verificationSteps = domain.certificates.getVerificationMap(this.chain, this.version, !!this.issuer.didDocument);
    this.verificationProcess = this.groomVerificationProcess(this.verificationSteps);

    this.documentToVerify = Object.assign<any, Blockcerts>({}, certificateJson);

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
  }

  getIssuingAddress (): string {
    if (!this.txData) {
      console.error('Trying to access issuing address when txData not available yet. Did you run the `verify` method yet?');
    }
    return this.txData?.issuingAddress;
  }

  async verify (stepCallback: IVerificationStepCallbackFn = () => {}): Promise<IFinalVerificationStatus> {
    this._stepCallback = stepCallback;
    this._stepsStatuses = [];

    for (const verificationStep of this.verificationProcess) {
      if (!this[verificationStep]) {
        return;
      }
      await this[verificationStep]();
    }

    // Send final callback update for global verification status
    const erroredStep = this._stepsStatuses.find(step => step.status === VERIFICATION_STATUSES.FAILURE);
    return erroredStep ? this._failed(erroredStep) : this._succeed();
  }

  groomVerificationProcess (verificationSteps: IVerificationMapItem[]): SUB_STEPS[] {
    return verificationSteps.reduce((subStepsList: SUB_STEPS[], step: IVerificationMapItem) => {
      step.subSteps.forEach(subStep => subStepsList.push(subStep.code));
      return subStepsList;
    }, []);
  }

  _getRevocationListUrl (distantIssuerProfile: Issuer): any { // TODO: define revocationList type
    if (this.issuer?.revocationList) {
      return this.issuer.revocationList;
    }
    return distantIssuerProfile.revocationList;
  }

  private async _doAction (step: string, action: () => any): Promise<any> {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let label: string;
    if (step) {
      label = domain.i18n.getText('subSteps', `${step}LabelPending`);
      log(label);
      this._updateStatusCallback(step, label, VERIFICATION_STATUSES.STARTING);
    }

    try {
      const res: any = await action();
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.SUCCESS);
        this._stepsStatuses.push({ step, label, status: VERIFICATION_STATUSES.SUCCESS });
      }
      return res;
    } catch (err) {
      if (step) {
        this._updateStatusCallback(step, label, VERIFICATION_STATUSES.FAILURE, err.message);
        this._stepsStatuses.push({
          code: step,
          label,
          status: VERIFICATION_STATUSES.FAILURE,
          errorMessage: err.message
        });
      }
    }
  }

  private _stepCallback (update: IVerificationStepCallbackAPI): any { // TODO: unsure type is indeed any
    // defined by this.verify interface
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

  private async checkImagesIntegrity (): Promise<void> {
    await this._doAction(
      SUB_STEPS.checkImagesIntegrity,
      async () => {
        await this.hashlinkVerifier.verifyHashlinkTable()
          .catch((error) => {
            console.error('hashlink verification error', error);
            throw new VerifierError(SUB_STEPS.checkImagesIntegrity, getText('errors', 'checkImagesIntegrity'));
          });
      }
    );
  }

  private async getIssuerProfile (): Promise<void> {
    this.issuer = await this._doAction(
      SUB_STEPS.getIssuerProfile,
      async () => await domain.verifier.getIssuerProfile(this.issuer)
    );
  }

  private async parseIssuerKeys (): Promise<void> {
    this.issuerPublicKeyList = await this._doAction(
      SUB_STEPS.parseIssuerKeys,
      () => domain.verifier.parseIssuerKeys(this.issuer)
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

  private async checkRevokedStatus (): Promise<void> {
    let keys;
    let revokedAddresses;
    if (this.version === Versions.V1_2) {
      revokedAddresses = this.txData.revokedAddresses;
      keys = [
        domain.verifier.parseRevocationKey(this.issuer),
        this.revocationKey
      ];
    } else {
      // Get revoked assertions
      revokedAddresses = await this._doAction(
        null,
        async () => await domain.verifier.getRevokedAssertions(this._getRevocationListUrl(this.issuer), this.id)
      );
      keys = this.id;
    }

    await this._doAction(SUB_STEPS.checkRevokedStatus, () =>
      inspectors.ensureNotRevoked(revokedAddresses, keys)
    );
  }

  private async checkAuthenticity (): Promise<void> {
    await this._doAction(SUB_STEPS.checkAuthenticity, () =>
      inspectors.ensureValidIssuingKey(this.issuerPublicKeyList, this.txData.issuingAddress, this.txData.time)
    );
  }

  private async checkExpiresDate (): Promise<void> {
    await this._doAction(SUB_STEPS.checkExpiresDate, () =>
      inspectors.ensureNotExpired(this.expires)
    );
  }

  private async controlVerificationMethod (): Promise<void> {
    await this._doAction(SUB_STEPS.controlVerificationMethod, () => {
      inspectors.controlVerificationMethod(this.issuer.didDocument, this.proof.verificationMethod);
    });
  }

  private async retrieveVerificationMethodPublicKey (): Promise<void> {
    await this._doAction(SUB_STEPS.retrieveVerificationMethodPublicKey, () => {
      this.verificationMethodPublicKey = inspectors.retrieveVerificationMethodPublicKey(this.issuer.didDocument, this.proof.verificationMethod);
    });
  }

  private async deriveIssuingAddressFromPublicKey (): Promise<void> {
    await this._doAction(SUB_STEPS.deriveIssuingAddressFromPublicKey, () => {
      this.derivedIssuingAddress = inspectors.deriveIssuingAddressFromPublicKey(this.verificationMethodPublicKey, this.chain);
    });
  }

  private async compareIssuingAddress (): Promise<void> {
    await this._doAction(SUB_STEPS.compareIssuingAddress, () => {
      inspectors.compareIssuingAddress(this.txData.issuingAddress, this.derivedIssuingAddress);
    });
  }

  /**
   * Returns a failure final step message
   */
  _failed (errorStep: IVerificationStepCallbackAPI): IFinalVerificationStatus {
    const message: string = errorStep.errorMessage;
    log(`failure:${message}`);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.FAILURE, message });
  }

  /**
   * whether or not the current verification is failing
   */
  _isFailing (): boolean {
    return this._stepsStatuses.some(step => step.status === VERIFICATION_STATUSES.FAILURE);
  }

  /**
   * Returns a final success message
   */
  _succeed (): IFinalVerificationStatus {
    const message = domain.chains.isMockChain(this.chain)
      ? domain.i18n.getText('success', 'mocknet')
      : domain.i18n.getText('success', 'blockchain');
    log(message);
    return this._setFinalStep({ status: VERIFICATION_STATUSES.SUCCESS, message });
  }

  _setFinalStep ({ status, message }: { status: string; message: string }): IFinalVerificationStatus {
    return { code: VerificationSteps.final, status, message };
  }

  /**
   * calls the origin callback to update on a step status
   */
  private _updateStatusCallback (code: string, label: string, status: string, errorMessage = ''): void {
    if (code != null) {
      const update: IVerificationStepCallbackAPI = { code, label, status };
      if (errorMessage) {
        update.errorMessage = errorMessage;
      }
      this._stepCallback(update);
    }
  }
}
