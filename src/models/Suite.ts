import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { IBlockchainObject } from '../constants/blockchains';
import type { Receipt } from './Receipt';
import type { Blockcerts } from './Blockcerts';
import type { ExplorerAPI } from '@blockcerts/explorer-lookup';
import type { Issuer } from './Issuer';

export interface SuiteAPI {
  actionMethod: (step: string, action) => Promise<any>;
  document: Blockcerts;
  explorerAPIs: ExplorerAPI[];
  issuer: Issuer;
}

interface OptionalSuiteMethods {
  verifyProof;
  getProofVerificationSteps;
  getIdentityVerificationSteps;
  getIssuerPublicKey;
  _doAction;
  // this function executes the identity verification logic, as added to the Identity Verification step
  verifyIdentity?: () => Promise<void>;
  // only needed for Blockchain anchoring suites
  getChain?: () => IBlockchainObject;
  getReceipt?: () => Receipt;
}

export abstract class Suite implements OptionalSuiteMethods {
  abstract type: string;
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  constructor (props: SuiteAPI) {}
  // this function executes the proof verification logic, as added to the Proof Verification step
  abstract verifyProof (): Promise<void>;
  // returns the substeps of the Proof Verification step as defined by the suite.
  // This will populate the `subSteps` property of the Proof Verification step object
  abstract getProofVerificationSteps (parentStepKey: string): VerificationSubstep[];
  // similarly, this function will return the substeps of the Identity Verification step.
  // return an empty array if no identity verification needs to occur
  abstract getIdentityVerificationSteps (parentStepKey: string): VerificationSubstep[];
  abstract getIssuerPublicKey (): string;

  // This method needs to become a reference to the `actionMethod` that's injected to the constructor.
  // `actionMethod` is bound to the verifier context to ensure proper execution of the steps
  abstract _doAction (step: string, action): Promise<any>;
}
