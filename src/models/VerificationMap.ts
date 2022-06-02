import type { VerificationSteps } from '../constants/verificationSteps';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';
import type { VERIFICATION_STATUSES } from '../constants/verificationStatuses';

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
