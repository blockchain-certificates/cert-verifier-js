import type { IVerificationMapItem } from '../../../models/VerificationMap';
import type VerificationSubstep from '../valueObjects/VerificationSubstep';

export default function findVerificationSubstep (code: string, verificationMap: IVerificationMapItem[]): VerificationSubstep {
  for (let i = 0; i < verificationMap.length; i++) {
    let candidateStep = verificationMap[i].subSteps.find(substep => substep.code === code);
    if (candidateStep) {
      return candidateStep;
    }
    if (verificationMap[i].suites?.length) {
      for (let j = 0; j < verificationMap[i].suites.length; j++) {
        candidateStep = verificationMap[i].suites[j].subSteps.find(substep => substep.code === code);
        if (candidateStep) {
          return candidateStep;
        }
      }
    }
  }
}
