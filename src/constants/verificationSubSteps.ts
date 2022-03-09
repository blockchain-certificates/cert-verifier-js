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
  getTransactionId = 'getTransactionId',
  computeLocalHash = 'computeLocalHash',
  fetchRemoteHash = 'fetchRemoteHash',
  getIssuerProfile = 'getIssuerProfile',
  parseIssuerKeys = 'parseIssuerKeys',
  compareHashes = 'compareHashes',
  checkImagesIntegrity = 'checkImagesIntegrity',
  checkMerkleRoot = 'checkMerkleRoot',
  checkReceipt = 'checkReceipt',
  checkIssuerSignature = 'checkIssuerSignature',
  checkIssuerIdentity = 'checkIssuerIdentity',
  checkAuthenticity = 'checkAuthenticity',
  checkRevokedStatus = 'checkRevokedStatus',
  checkExpiresDate = 'checkExpiresDate',
  controlVerificationMethod = 'controlVerificationMethod',
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  deriveIssuingAddressFromPublicKey = 'deriveIssuingAddressFromPublicKey',
  compareIssuingAddress = 'compareIssuingAddress'
}

function getTextFor (subStep: string, status: string): string {
  return i18n[currentLocale.locale].subSteps[`${subStep}${status}`];
}

const LABEL = 'Label';
const LABEL_PENDING = 'LabelPending';

const subStepsMap = {
  [VerificationSteps.formatValidation]: [SUB_STEPS.getTransactionId, SUB_STEPS.computeLocalHash, SUB_STEPS.fetchRemoteHash, SUB_STEPS.checkImagesIntegrity, SUB_STEPS.getIssuerProfile, SUB_STEPS.parseIssuerKeys],
  [VerificationSteps.hashComparison]: [SUB_STEPS.compareHashes, SUB_STEPS.checkMerkleRoot, SUB_STEPS.checkReceipt],
  [VerificationSteps.identityVerification]: [SUB_STEPS.controlVerificationMethod, SUB_STEPS.retrieveVerificationMethodPublicKey, SUB_STEPS.deriveIssuingAddressFromPublicKey, SUB_STEPS.compareIssuingAddress],
  [VerificationSteps.statusCheck]: [SUB_STEPS.checkIssuerSignature, SUB_STEPS.checkAuthenticity, SUB_STEPS.checkRevokedStatus, SUB_STEPS.checkExpiresDate]
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
