import type { VerificationSteps } from '../constants/verificationSteps';
import type VerificationSubstep from '../domain/verifier/valueObjects/VerificationSubstep';

export interface IVerificationMapItem {
  code: VerificationSteps;
  label: string;
  labelPending: string;
  subSteps: VerificationSubstep[];
}
