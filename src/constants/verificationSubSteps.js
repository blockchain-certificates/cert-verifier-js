import * as STEPS from './verificationSteps';

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
const
  checkExpiresDate = 'checkExpiresDate';

const language = {
  [getTransactionId]: {
    code: getTransactionId,
    label: 'Get transaction ID',
    labelPending: 'Getting transaction ID',
    parentStep: STEPS.formatValidation
  },
  [computeLocalHash]: {
    code: computeLocalHash,
    label: 'Compute local hash',
    labelPending: 'Computing local hash',
    parentStep: STEPS.formatValidation
  },
  [fetchRemoteHash]: {
    code: fetchRemoteHash,
    label: 'Fetch remote hash',
    labelPending: 'Fetching remote hash',
    parentStep: STEPS.formatValidation
  },
  [getIssuerProfile]: {
    code: getIssuerProfile,
    label: 'Get issuer profile',
    labelPending: 'Getting issuer profile',
    parentStep: STEPS.formatValidation
  },
  [parseIssuerKeys]: {
    code: parseIssuerKeys,
    label: 'Parse issuer keys',
    labelPending: 'Parsing issuer keys',
    parentStep: STEPS.formatValidation
  },
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
