import { BLOCKCHAINS, CERTIFICATE_VERSIONS, STEPS, SUB_STEPS } from '../../../constants';
import isTestChain from '../../chains/useCases/isTestChain';

const versionVerificationMap = {
  [CERTIFICATE_VERSIONS.V1_2]: [
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
  [CERTIFICATE_VERSIONS.V2_0]: [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.checkAuthenticity,
    SUB_STEPS.checkExpiresDate
  ],
  [BLOCKCHAINS.mocknet.code]: [
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkExpiresDate
  ]
};

/**
 * getFullStepsFromSubSteps
 *
 * Builds a full steps array (with subSteps property) from an array of sub-steps
 *
 * @param subStepMap
 * @returns {Array}
 */
function getFullStepsFromSubSteps (subStepMap) {
  // Get deep copy of steps
  const steps = JSON.parse(JSON.stringify(STEPS.language));
  let subSteps = subStepMap.map(stepCode => Object.assign({}, SUB_STEPS.language[stepCode]));
  subSteps.forEach(subStep => steps[subStep.parentStep].subSteps.push(subStep));

  let stepsArray = [];
  Object.keys(steps).forEach(stepCode => stepsArray.push({...steps[stepCode], code: stepCode}));

  return stepsArray;
}

export default function getVerificationMap (chain, version = CERTIFICATE_VERSIONS.V2_0) {
  if (!chain) {
    return [];
  }

  let key = version;
  if (isTestChain(chain)) {
    key = BLOCKCHAINS.mocknet.code;
  }

  const verificationMap = Object.assign(versionVerificationMap);
  return getFullStepsFromSubSteps(verificationMap[key]);
}
