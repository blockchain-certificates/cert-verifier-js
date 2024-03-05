import VerificationSubstep from '../valueObjects/VerificationSubstep';
import type { VerificationSteps } from '../entities/verificationSteps';

export default function convertToVerificationSubsteps (parentStepKey: string | VerificationSteps, subStepKey: string): VerificationSubstep {
  return new VerificationSubstep(parentStepKey, subStepKey);
}
