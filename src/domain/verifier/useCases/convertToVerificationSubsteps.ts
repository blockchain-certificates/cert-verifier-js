import VerificationSubstep from '../valueObjects/VerificationSubstep';
import type { VerificationSteps } from '../../../constants/verificationSteps';

export default function convertToVerificationSubsteps (parentStepKey: string | VerificationSteps, subStepKey: string): VerificationSubstep {
  return new VerificationSubstep(parentStepKey, subStepKey);
}
