import * as STEPS from './verificationSteps';
import i18n from '../data/i18n';

const getTransactionId = 'getTransactionId';
const computeLocalHash = 'computeLocalHash';
const fetchRemoteHash = 'fetchRemoteHash';
const getIssuerProfile = 'getIssuerProfile';
const parseIssuerKeys = 'parseIssuerKeys';
const compareHashes = 'compareHashes';
const checkMerkleRoot = 'checkMerkleRoot';
const checkReceipt = 'checkReceipt';
const checkIssuerSignature = 'checkIssuerSignature';
const checkAuthenticity = 'checkAuthenticity';
const checkRevokedStatus = 'checkRevokedStatus';
const checkExpiresDate = 'checkExpiresDate';

function getTextFor (subStep, status) {
  return i18n['en-US'].subSteps[`${subStep}${status}`];
}

const LABEL = 'Label';
const LABEL_PENDING = 'LabelPending';

const subStepsMap = {
  [STEPS.formatValidation]: [getTransactionId, computeLocalHash, fetchRemoteHash, getIssuerProfile, parseIssuerKeys]
};

const generateSubsteps = (substeps, parentKey) => {
  return substeps.reduce((acc, curr) => {
    acc[curr] = {
      code: curr,
      label: getTextFor(curr, LABEL),
      labelPending: getTextFor(curr, LABEL_PENDING),
      parentStep: parentKey
    };
    return acc;
  }, {});
}

const language = {
  ...generateSubsteps(subStepsMap[STEPS.formatValidation], STEPS.formatValidation),
  [compareHashes]: {
    code: compareHashes,
    label: 'Compare hashes',
    labelPending: 'Comparing hashes',
    parentStep: STEPS.hashComparison
  },
  [checkMerkleRoot]: {
    code: checkMerkleRoot,
    label: 'Check Merkle Root',
    labelPending: 'Checking Merkle Root',
    parentStep: STEPS.hashComparison
  },
  [checkReceipt]: {
    code: checkReceipt,
    label: 'Check Receipt',
    labelPending: 'Checking Receipt',
    parentStep: STEPS.hashComparison
  },
  [checkIssuerSignature]: {
    code: checkIssuerSignature,
    label: 'Check Issuer Signature',
    labelPending: 'Checking Issuer Signature',
    parentStep: STEPS.statusCheck
  },
  [checkAuthenticity]: {
    code: checkAuthenticity,
    label: 'Check Authenticity',
    labelPending: 'Checking Authenticity',
    parentStep: STEPS.statusCheck
  },
  [checkRevokedStatus]: {
    code: checkRevokedStatus,
    label: 'Check Revoked Status',
    labelPending: 'Checking Revoked Status',
    parentStep: STEPS.statusCheck
  },
  [checkExpiresDate]: {
    code: checkExpiresDate,
    label: 'Check Expiration Date',
    labelPending: 'Checking Expiration Date',
    parentStep: STEPS.statusCheck
  }
};

export {
  getTransactionId,
  computeLocalHash,
  fetchRemoteHash,
  getIssuerProfile,
  parseIssuerKeys,
  compareHashes,
  checkMerkleRoot,
  checkReceipt,
  checkIssuerSignature,
  checkAuthenticity,
  checkRevokedStatus,
  checkExpiresDate,
  language
};
