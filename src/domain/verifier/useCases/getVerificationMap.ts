import getParentVerificationSteps, { type VerificationSteps, SUB_STEPS, verificationMap } from '../entities/verificationSteps'; // TODO: circular dependency
import domain from '../../index';
import { removeEntry } from '../../../helpers/array';
import type VerificationSubstep from '../valueObjects/VerificationSubstep';
import type { IVerificationMapItem } from '../../../models/VerificationMap';

export function getVerificationStepsForCurrentCase (hasDid: boolean, hasHashlinks: boolean, hasValidFrom: boolean, hasCredentialSchema: boolean): SUB_STEPS[] {
  const verificationSteps = Object.values(SUB_STEPS);

  if (!hasDid) {
    removeEntry(verificationSteps, SUB_STEPS.controlVerificationMethod);
  }

  if (!hasHashlinks) {
    removeEntry(verificationSteps, SUB_STEPS.checkImagesIntegrity);
  }

  if (!hasValidFrom) {
    removeEntry(verificationSteps, SUB_STEPS.ensureValidityPeriodStarted);
  }

  if (!hasCredentialSchema) {
    removeEntry(verificationSteps, SUB_STEPS.checkCredentialSchemaConformity);
  }

  return verificationSteps;
}

function filterSubStepsForParentStep (parentStepKey: VerificationSteps, substepsList: SUB_STEPS[]): VerificationSubstep[] {
  const childSteps: SUB_STEPS[] = verificationMap[parentStepKey];
  const filteredChildSteps: SUB_STEPS[] = childSteps.filter(childStep => substepsList.includes(childStep));

  return filteredChildSteps.map(childStepKey =>
    domain.verifier.convertToVerificationSubsteps(parentStepKey, childStepKey)
  );
}

function getFullStepsWithSubSteps (verificationSubStepsList: SUB_STEPS[]): IVerificationMapItem[] {
  const steps = getParentVerificationSteps();
  return Object.keys(steps)
    .map(parentStepKey => ({
      ...steps[parentStepKey],
      subSteps: filterSubStepsForParentStep((parentStepKey as VerificationSteps), verificationSubStepsList)
    }));
}

export default function getVerificationMap (hasDid: boolean = false, hasHashlinks: boolean = false, hasValidFrom: boolean = false, hasCredentialSchema: boolean = false): {
  verificationMap: IVerificationMapItem[];
  verificationProcess: SUB_STEPS[];
} {
  const verificationProcess: SUB_STEPS[] = getVerificationStepsForCurrentCase(hasDid, hasHashlinks, hasValidFrom, hasCredentialSchema);
  return {
    verificationProcess,
    verificationMap: getFullStepsWithSubSteps(verificationProcess)
  };
}
