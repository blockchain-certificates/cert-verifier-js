import type { VerificationSteps } from '../constants/verificationSteps.js';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep.js';
import type { VERIFICATION_STATUSES } from '../constants/verificationStatuses.js';

export interface IVerificationMapItemSuite {
  proofType: string;
  subSteps: VerificationSubstep[];
}

export interface IVerificationMapItem {
  code: VerificationSteps;
  label: string;
  labelPending: string;
  subSteps?: VerificationSubstep[];
  status?: VERIFICATION_STATUSES;
  suites?: IVerificationMapItemSuite[];
}
