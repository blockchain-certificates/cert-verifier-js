import * as STEPS from './verificationSteps';
import i18n from '../data/i18n.json';

export interface IVerificationSubstep {
  code: string;
  label: string;
  labelPending: string;
  parentStep: STEPS;
}

export interface ISubstepList {
  [key: string]: IVerificationSubstep;
}

const getTransactionId = 'getTransactionId';
const computeLocalHash = 'computeLocalHash';
const fetchRemoteHash = 'fetchRemoteHash';
const getIssuerProfile = 'getIssuerProfile';
const parseIssuerKeys = 'parseIssuerKeys';
const compareHashes = 'compareHashes';
const checkMerkleRoot = 'checkMerkleRoot';
const checkReceipt = 'checkReceipt';
const checkIssuerSignature = 'checkIssuerSignature';
const checkIssuerIdentity = 'checkIssuerIdentity';
const checkAuthenticity = 'checkAuthenticity';
const checkRevokedStatus = 'checkRevokedStatus';
const checkExpiresDate = 'checkExpiresDate';

function getTextFor (subStep: string, status: string): string {
  return i18n['en-US'].subSteps[`${subStep}${status}`];
}

const LABEL = 'Label';
const LABEL_PENDING = 'LabelPending';

const subStepsMap = {
  [STEPS.formatValidation]: [getTransactionId, computeLocalHash, fetchRemoteHash, getIssuerProfile, parseIssuerKeys],
  [STEPS.hashComparison]: [compareHashes, checkMerkleRoot, checkReceipt],
  [STEPS.statusCheck]: [checkIssuerIdentity, checkIssuerSignature, checkAuthenticity, checkRevokedStatus, checkExpiresDate]
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

const language: ISubstepList = Object.keys(subStepsMap).reduce((acc, parentStepKey) => {
  return Object.assign(acc, generateSubsteps(parentStepKey));
}, {});

export {
  getTransactionId,
  computeLocalHash,
  fetchRemoteHash,
  getIssuerProfile,
  parseIssuerKeys,
  compareHashes,
  checkMerkleRoot,
  checkReceipt,
  checkIssuerIdentity,
  checkIssuerSignature,
  checkAuthenticity,
  checkRevokedStatus,
  checkExpiresDate,
  language
};
