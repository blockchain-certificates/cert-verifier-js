import { NETWORKS } from '../../../constants';
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

type TNetworkVerificationStepList = {
  [key in NETWORKS]: SUB_STEPS[];
};

function removeStep (map: string[], step: string): void {
  const stepIndex = map.findIndex(subStep => subStep === step);
  map.splice(stepIndex, 1);
}

export function getVerificationStepsForChain (chain: IBlockchainObject, version: Versions): SUB_STEPS[] {
  const network = chainsService.isMockChain(chain) ? NETWORKS.testnet : NETWORKS.mainnet;
  const networkVerificationMap: TNetworkVerificationStepList = {
    [NETWORKS.mainnet]: [
      SUB_STEPS.getTransactionId,
      SUB_STEPS.computeLocalHash,
      SUB_STEPS.fetchRemoteHash,
      SUB_STEPS.getIssuerProfile,
      SUB_STEPS.parseIssuerKeys,
      SUB_STEPS.compareHashes,
      SUB_STEPS.checkImagesIntegrity,
      SUB_STEPS.checkMerkleRoot,
      SUB_STEPS.checkReceipt,
      SUB_STEPS.controlVerificationMethod,
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      SUB_STEPS.deriveIssuingAddressFromPublicKey,
      SUB_STEPS.compareIssuingAddress,
      SUB_STEPS.checkRevokedStatus,
      SUB_STEPS.checkAuthenticity,
      SUB_STEPS.checkExpiresDate
    ],
    [NETWORKS.testnet]: [
      SUB_STEPS.computeLocalHash,
      SUB_STEPS.compareHashes,
      SUB_STEPS.checkImagesIntegrity,
      SUB_STEPS.checkReceipt,
      SUB_STEPS.controlVerificationMethod,
      SUB_STEPS.retrieveVerificationMethodPublicKey,
      SUB_STEPS.deriveIssuingAddressFromPublicKey,
      SUB_STEPS.compareIssuingAddress,
      SUB_STEPS.checkExpiresDate
    ]
  };

  if (isV3(version)) {
    removeStep(networkVerificationMap[network], SUB_STEPS.getIssuerProfile);
  }

  return networkVerificationMap[network];
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
