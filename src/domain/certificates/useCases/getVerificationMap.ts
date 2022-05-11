import chainsService from '../../chains';
import { getText } from '../../i18n/useCases';
import type Versions from '../../../constants/certificateVersions';
import { isV3 } from '../../../constants/certificateVersions';
import type { IVerificationSubstep } from '../../../constants/verificationSteps';
import getParentVerificationSteps, { VerificationSteps, SUB_STEPS } from '../../../constants/verificationSteps';
import type { IBlockchainObject } from '../../../constants/blockchains';

export interface IVerificationMapItem {
  code: VerificationSteps;
  label: string;
  labelPending: string;
  subSteps: IVerificationSubstep[];
}

function removeStep (map: string[], step: string): void {
  const stepIndex = map.findIndex(subStep => subStep === step);
  map.splice(stepIndex, 1);
}

export function getVerificationStepsForCurrentCase (chain: IBlockchainObject, version: Versions, hasDid: boolean): SUB_STEPS[] {
  const verificationSteps = Object.values(SUB_STEPS);

  if (chainsService.isMockChain(chain)) {
    removeStep(verificationSteps, SUB_STEPS.getTransactionId);
    removeStep(verificationSteps, SUB_STEPS.fetchRemoteHash);
    removeStep(verificationSteps, SUB_STEPS.getIssuerProfile);
    removeStep(verificationSteps, SUB_STEPS.parseIssuerKeys);
    removeStep(verificationSteps, SUB_STEPS.checkMerkleRoot);
    removeStep(verificationSteps, SUB_STEPS.checkRevokedStatus);
    removeStep(verificationSteps, SUB_STEPS.checkAuthenticity);
  }

  if (isV3(version)) {
    removeStep(verificationSteps, SUB_STEPS.getIssuerProfile);
  }

  if (!hasDid) {
    removeStep(verificationSteps, SUB_STEPS.controlVerificationMethod);
    removeStep(verificationSteps, SUB_STEPS.retrieveVerificationMethodPublicKey);
    removeStep(verificationSteps, SUB_STEPS.deriveIssuingAddressFromPublicKey);
    removeStep(verificationSteps, SUB_STEPS.compareIssuingAddress);
  }

  return verificationSteps;
}

const verificationMap = {
  [VerificationSteps.formatValidation]: [
    SUB_STEPS.getIssuerProfile,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.checkImagesIntegrity
  ],
  [VerificationSteps.signatureVerification]: [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt
  ],
  [VerificationSteps.identityVerification]: [
    SUB_STEPS.controlVerificationMethod,
    SUB_STEPS.retrieveVerificationMethodPublicKey,
    SUB_STEPS.deriveIssuingAddressFromPublicKey,
    SUB_STEPS.compareIssuingAddress
  ],
  [VerificationSteps.statusCheck]: [
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.checkAuthenticity,
    SUB_STEPS.checkExpiresDate
  ]
};

function filterSubStepsForParentStep (parentStepKey: VerificationSteps, substepsList: SUB_STEPS[]): IVerificationSubstep[] {
  const childSteps: SUB_STEPS[] = verificationMap[parentStepKey];
  const filteredChildSteps: SUB_STEPS[] = childSteps.filter(childStep => substepsList.includes(childStep));

  return filteredChildSteps.map(childStep => ({
    code: childStep,
    label: getText('subSteps', `${childStep}Label`),
    labelPending: getText('subSteps', `${childStep}LabelPending`),
    parentStep: parentStepKey
  }));
}

function getFullStepsWithSubSteps (verificationSubStepsList: SUB_STEPS[]): IVerificationMapItem[] {
  const steps = getParentVerificationSteps();
  return Object.keys(steps)
    .map(parentStepKey => ({
      ...steps[parentStepKey],
      subSteps: filterSubStepsForParentStep((parentStepKey as VerificationSteps), verificationSubStepsList)
    }))
    .filter(parentStep => parentStep.subSteps.length > 0);
}

export default function getVerificationMap (chain: IBlockchainObject, version: Versions, hasDid: boolean = false): IVerificationMapItem[] {
  if (!chain) {
    return [];
  }

  return getFullStepsWithSubSteps(getVerificationStepsForCurrentCase(chain, version, hasDid));
}
