import type { IVerificationMapItem } from '../../../models/VerificationMap';
import type VerificationSubstep from '../valueObjects/VerificationSubstep';

export default function findVerificationSubstep (
  code: string,
  verificationMap: IVerificationMapItem[],
  verificationSuite: string = ''
): VerificationSubstep {
  for (let i = 0; i < verificationMap.length; i++) {
    let candidateStep = verificationMap[i].subSteps.find(substep => substep.code === code);
    if (candidateStep && verificationSuite === '') {
      return candidateStep;
    }
    if (verificationMap[i].suites?.length) {
      for (let j = 0; j < verificationMap[i].suites.length; j++) {
        const currentSuite = verificationMap[i].suites[j];
        candidateStep = currentSuite.subSteps.find(substep => substep.code === code);
        if (candidateStep && currentSuite.proofType === verificationSuite) {
          return candidateStep;
        }
      }
    }
  }
}
