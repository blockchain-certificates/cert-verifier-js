import { NETWORKS, STEPS, SUB_STEPS } from '../../../constants';
import chainsService from '../../chains';

const versionVerificationMap = {
  [NETWORKS.mainnet]: [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.getIssuerProfile,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.checkAuthenticity,
    SUB_STEPS.checkExpiresDate
  ],
  [NETWORKS.testnet]: [
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkExpiresDate
  ]
};

/**
 * stepsObjectToArray
 *
 * Turn an object with steps as properties to an array
 *
 * @param stepsObject
 * @returns {{code: string}[]}
 */
function stepsObjectToArray (stepsObject) {
  return Object.keys(stepsObject).map(stepCode => {
    return {...stepsObject[stepCode], code: stepCode};
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
function setSubStepsToSteps (subSteps) {
  const steps = JSON.parse(JSON.stringify(STEPS.language));
  subSteps.forEach(subStep => steps[subStep.parentStep].subSteps.push(subStep));
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
function getFullStepsFromSubSteps (subStepMap) {
  let subSteps = subStepMap.map(stepCode => Object.assign({}, SUB_STEPS.language[stepCode]));

  const steps = setSubStepsToSteps(subSteps);

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
export default function getVerificationMap (chain) {
  if (!chain) {
    return [];
  }

  let network = chainsService.isMockChain(chain) ? NETWORKS.testnet : NETWORKS.mainnet;
  const verificationMap = Object.assign(versionVerificationMap);
  return getFullStepsFromSubSteps(verificationMap[network]);
}
