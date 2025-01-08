import getParentVerificationSteps, {
  SUB_STEPS,
  verificationMap,
  VerificationSteps
} from '../entities/verificationSteps'; // TODO: circular dependency
import domain from '../../index';
import { removeEntry } from '../../../helpers/array';
import type VerificationSubstep from '../valueObjects/VerificationSubstep';
import type { IVerificationMapItem } from '../../../models/VerificationMap';

export interface VerificationMapFilters {
  hasDid?: boolean;
  hasHashlinks?: boolean;
  hasValidFrom?: boolean;
  hasCredentialSchema?: boolean;
  isVCV2?: boolean;
  isVerifiablePresentation?: boolean;
}
export function getVerificationStepsForCurrentCase ({
  hasDid = false,
  hasHashlinks = false,
  hasValidFrom = false,
  hasCredentialSchema = false,
  isVCV2 = false,
  isVerifiablePresentation = false
}: VerificationMapFilters): SUB_STEPS[] {
  const baseMap = JSON.parse(JSON.stringify(verificationMap));

  if (!hasDid) {
    removeEntry(baseMap[VerificationSteps.identityVerification], SUB_STEPS.controlVerificationMethod);
  }

  if (!hasHashlinks) {
    removeEntry(baseMap[VerificationSteps.formatValidation], SUB_STEPS.checkImagesIntegrity);
  }

  if (!hasValidFrom || isVerifiablePresentation) {
    removeEntry(baseMap[VerificationSteps.statusCheck], SUB_STEPS.ensureValidityPeriodStarted);
  }

  if (!hasCredentialSchema) {
    removeEntry(baseMap[VerificationSteps.formatValidation], SUB_STEPS.checkCredentialSchemaConformity);
  }

  if (!isVCV2) {
    removeEntry(baseMap[VerificationSteps.formatValidation], SUB_STEPS.validateDateFormat);
  }

  const verificationSteps = Object.keys(baseMap).map(parentStep => baseMap[parentStep]).flat();

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

export default function getVerificationMap (filters: VerificationMapFilters = {}): {
  verificationMap: IVerificationMapItem[];
  verificationProcess: SUB_STEPS[];
} {
  const verificationProcess: SUB_STEPS[] = getVerificationStepsForCurrentCase(filters);
  return {
    verificationProcess,
    verificationMap: getFullStepsWithSubSteps(verificationProcess)
  };
}
