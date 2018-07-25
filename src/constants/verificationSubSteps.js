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
const checkExpiresDate = 'checkExpiresDate';

const language = {
  [getTransactionId]: {
    parentStep: STEPS.formatValidation,
    label: 'Get transaction ID',
    actionLabel: 'Getting transaction ID'
  },
  [computeLocalHash]: {
    parentStep: STEPS.formatValidation,
    label: 'Compute local hash',
    actionLabel: 'Computing local hash'
  },
  [fetchRemoteHash]: {
    parentStep: STEPS.formatValidation,
    label: 'Fetch remote hash',
    actionLabel: 'Fetching remote hash'
  },
  [getIssuerProfile]: {
    parentStep: STEPS.formatValidation,
    label: 'Get issuer profile',
    actionLabel: 'Getting issuer profile'
  },
  [parseIssuerKeys]: {
    parentStep: STEPS.formatValidation,
    label: 'Parse issuer keys',
    actionLabel: 'Parsing issuer keys'
  },
  [compareHashes]: {
    parentStep: STEPS.hashComparison,
    label: 'Compare hashes',
    actionLabel: 'Comparing hashes'
  },
  [checkMerkleRoot]: {
    parentStep: STEPS.hashComparison,
    label: 'Check Merkle Root',
    actionLabel: 'Checking Merkle Root'
  },
  [checkReceipt]: {
    parentStep: STEPS.hashComparison,
    label: 'Check Receipt',
    actionLabel: 'Checking Receipt'
  },
  [checkIssuerSignature]: {
    parentStep: STEPS.statusCheck,
    label: 'Check Issuer Signature',
    actionLabel: 'Checking Issuer Signature'
  },
  [checkAuthenticity]: {
    parentStep: STEPS.statusCheck,
    label: 'Check Authenticity',
    actionLabel: 'Checking Authenticity'
  },
  [checkRevokedStatus]: {
    parentStep: STEPS.statusCheck,
    label: 'Check Revoked Status',
    actionLabel: 'Checking Revoked Status'
  },
  [checkExpiresDate]: {
    parentStep: STEPS.statusCheck,
    label: 'Check Expires Date',
    actionLabel: 'Checking Expires Date'
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
