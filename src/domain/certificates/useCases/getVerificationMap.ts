import chainsService from '../../chains';
import { getText } from '../../i18n/useCases';
import type Versions from '../../../constants/certificateVersions';
import { isV3 } from '../../../constants/certificateVersions';
import type { IVerificationSubstep } from '../../../constants/verificationSubSteps';
import { SUB_STEPS, substepsList } from '../../../constants/verificationSubSteps';
import type {
  TVerificationStepsList,
  VerificationSteps
} from '../../../constants/verificationSteps';
import getMainVerificationSteps from '../../../constants/verificationSteps';
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

export function getVerificationStepsForChain (chain: IBlockchainObject, version: Versions): SUB_STEPS[] {
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

  return verificationSteps;
}

/**
 * stepsObjectToArray
 *
 * Turn an object with steps as properties to an array
 *
 * @param stepsObject
 * @returns {{code: string}[]}
 */
function stepsObjectToArray (stepsObject: TVerificationStepsList): IVerificationMapItem[] {
  return Object.keys(stepsObject).map(stepCode => {
    return {
      ...stepsObject[stepCode],
      code: stepCode,
      label: getText('steps', `${stepCode}Label`),
      labelPending: getText('steps', `${stepCode}LabelPending`)
    };
  });
}

/**
 * setSubStepsToSteps
 *
 * Takes an array of sub-steps and set them to their proper parent step
 *
 * @param subSteps
 * @returns {any}
 */
function setSubStepsToSteps (subSteps: IVerificationSubstep[], hasDid: boolean): TVerificationStepsList {
  const steps = getMainVerificationSteps(hasDid);
  subSteps
    .forEach(subStep => !!steps[subStep.parentStep] && steps[subStep.parentStep].subSteps.push(subStep));
  return steps;
}

/**
 * getFullStepsFromSubSteps
 *
 * Builds a full steps array (with subSteps property) from an array of sub-steps
 *
 * @param subStepMap
 * @returns {Array}
 */
function getFullStepsFromSubSteps (subStepMap: SUB_STEPS[], hasDid: boolean): IVerificationMapItem[] {
  const subSteps: IVerificationSubstep[] = subStepMap.map(stepCode => {
    const subStep = Object.assign({}, substepsList[stepCode]);
    return {
      ...subStep,
      label: getText('subSteps', `${stepCode}Label`),
      labelPending: getText('subSteps', `${stepCode}LabelPending`)
    };
  });

  const steps = setSubStepsToSteps(subSteps, hasDid);

  return stepsObjectToArray(steps);
}

/**
 * getVerificationMap
 *
 * Get verification map from the chain
 *
 * @param chain
 * @returns {Array}
 */
export default function getVerificationMap (chain: IBlockchainObject, version: Versions, hasDid: boolean = false): IVerificationMapItem[] {
  if (!chain) {
    return [];
  }

  return getFullStepsFromSubSteps(getVerificationStepsForChain(chain, version), hasDid);
}
