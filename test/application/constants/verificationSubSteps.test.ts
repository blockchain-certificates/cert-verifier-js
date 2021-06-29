import { language } from '../../../src/constants/verificationSubSteps';

const expectedSubSteps = {
  checkAuthenticity: {
    code: 'checkAuthenticity',
    label: 'Check Authenticity',
    labelPending: 'Checking Authenticity',
    parentStep: 'statusCheck'
  },
  checkExpiresDate: {
    code: 'checkExpiresDate',
    label: 'Check Expiration Date',
    labelPending: 'Checking Expiration Date',
    parentStep: 'statusCheck'
  },
  checkIssuerIdentity: {
    code: 'checkIssuerIdentity',
    label: 'Check Issuer Identity',
    labelPending: 'Checking Issuer Identity',
    parentStep: 'statusCheck'
  },
  checkIssuerSignature: {
    code: 'checkIssuerSignature',
    label: 'Check Issuer Signature',
    labelPending: 'Checking Issuer Signature',
    parentStep: 'statusCheck'
  },
  checkMerkleRoot: {
    code: 'checkMerkleRoot',
    label: 'Check Merkle Root',
    labelPending: 'Checking Merkle Root',
    parentStep: 'hashComparison'
  },
  checkReceipt: {
    code: 'checkReceipt',
    label: 'Check Receipt',
    labelPending: 'Checking Receipt',
    parentStep: 'hashComparison'
  },
  checkRevokedStatus: {
    code: 'checkRevokedStatus',
    label: 'Check Revoked Status',
    labelPending: 'Checking Revoked Status',
    parentStep: 'statusCheck'
  },
  compareHashes: {
    code: 'compareHashes',
    label: 'Compare hashes',
    labelPending: 'Comparing hashes',
    parentStep: 'hashComparison'
  },
  computeLocalHash: {
    code: 'computeLocalHash',
    label: 'Compute local hash',
    labelPending: 'Computing local hash',
    parentStep: 'formatValidation'
  },
  fetchRemoteHash: {
    code: 'fetchRemoteHash',
    label: 'Fetch remote hash',
    labelPending: 'Fetching remote hash',
    parentStep: 'formatValidation'
  },
  getIssuerProfile: {
    code: 'getIssuerProfile',
    label: 'Get issuer profile',
    labelPending: 'Getting issuer profile',
    parentStep: 'formatValidation'
  },
  getTransactionId: {
    code: 'getTransactionId',
    label: 'Get transaction ID',
    labelPending: 'Getting transaction ID',
    parentStep: 'formatValidation'
  },
  parseIssuerKeys: {
    code: 'parseIssuerKeys',
    label: 'Parse issuer keys',
    labelPending: 'Parsing issuer keys',
    parentStep: 'formatValidation'
  }
};

describe('verificationSubSteps test suite', function () {
  describe('language property', function () {
    it('should output the expected shape', function () {
      expect(language).toEqual(expectedSubSteps);
    });
  });
});
