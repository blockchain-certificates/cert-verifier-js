import VerificationSubstep from '../valueObjects/VerificationSubstep.js';
import type { VerificationSteps } from '../../../constants/verificationSteps.js';

export default function convertToVerificationSubsteps (parentStepKey: string | VerificationSteps, subStepKey: string): VerificationSubstep {
  return new VerificationSubstep(parentStepKey, subStepKey);
}
