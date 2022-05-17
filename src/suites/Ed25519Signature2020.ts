import domain from '../domain';
import { Suite } from '../models/Suite';
import type { Blockcerts } from '../models/Blockcerts';
import type { Issuer } from '../models/Issuer';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { SuiteAPI } from '../models/Suite';

enum SUB_STEPS {}

export default class Ed25519Signature2020 extends Suite {
  public verificationProcess = [];

  public documentToVerify: Blockcerts;
  public issuer: Issuer;
  public type = 'Ed25519Signature2020';

  constructor (props: SuiteAPI) {
    super(props);
    if (props.actionMethod) {
      this._doAction = props.actionMethod;
    }
    this.documentToVerify = props.document;
    this.issuer = props.issuer;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async verifyProof (): Promise<void> {}

  getProofVerificationSteps (parentStepKey): VerificationSubstep[] {
    return this.verificationProcess.map(childStepKey =>
      domain.verifier.convertToVerificationSubsteps(parentStepKey, childStepKey)
    );
  }

  getIdentityVerificationSteps (): VerificationSubstep[] {
    return [];
  }

  getIssuerPublicKey (): string {
    return 'not implemented';
  }

  async _doAction (step: string, action): Promise<any> {
    throw new Error('doAction method needs to be overwritten by injecting from CVJS');
  }
}
