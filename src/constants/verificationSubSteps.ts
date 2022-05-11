import i18n from '../data/i18n.json';
import { VerificationSteps } from './verificationSteps';
import currentLocale from './currentLocale';

export interface IVerificationSubstep {
  code: SUB_STEPS;
  label: string;
  labelPending: string;
  parentStep: VerificationSteps;
}

export interface ISubstepList {
  [key: string]: IVerificationSubstep;
}

enum SUB_STEPS {
  getTransactionId = 'getTransactionId', // MerkleProof2019 specific
  computeLocalHash = 'computeLocalHash', // MerkleProof2019 specific
  fetchRemoteHash = 'fetchRemoteHash', // MerkleProof2019 specific
  getIssuerProfile = 'getIssuerProfile',
  parseIssuerKeys = 'parseIssuerKeys',
  compareHashes = 'compareHashes', // MerkleProof2019 specific
  checkImagesIntegrity = 'checkImagesIntegrity',
  checkMerkleRoot = 'checkMerkleRoot', // MerkleProof2019 specific
  checkReceipt = 'checkReceipt', // MerkleProof2019 specific
  checkRevokedStatus = 'checkRevokedStatus',
  checkAuthenticity = 'checkAuthenticity',
  checkExpiresDate = 'checkExpiresDate',
  controlVerificationMethod = 'controlVerificationMethod',
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  deriveIssuingAddressFromPublicKey = 'deriveIssuingAddressFromPublicKey', // MerkleProof2019 specific
  compareIssuingAddress = 'compareIssuingAddress' // MerkleProof2019 specific
}

function getTextFor (subStep: string, status: string): string {
  return i18n[currentLocale.locale].subSteps[`${subStep}${status}`];
}

const LABEL = 'Label';
const LABEL_PENDING = 'LabelPending';

const subStepsMap = {
  [VerificationSteps.formatValidation]: [
    SUB_STEPS.checkImagesIntegrity,
    SUB_STEPS.getIssuerProfile,
    SUB_STEPS.parseIssuerKeys
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
    SUB_STEPS.checkAuthenticity,
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.checkExpiresDate
  ]
};

function generateSubsteps (parentKey): ISubstepList {
  return subStepsMap[parentKey].reduce((acc, curr) => {
    acc[curr] = {
      code: curr,
      label: getTextFor(curr, LABEL),
      labelPending: getTextFor(curr, LABEL_PENDING),
      parentStep: parentKey
    };
    return acc;
  }, {});
}

const substepsList: ISubstepList = Object.keys(subStepsMap).reduce((acc, parentStepKey) => {
  return Object.assign(acc, generateSubsteps(parentStepKey));
}, {});

export {
  SUB_STEPS,
  substepsList
};
