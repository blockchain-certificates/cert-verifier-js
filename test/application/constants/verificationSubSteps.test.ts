import { SUB_STEPS, substepsList } from '../../../src/constants/verificationSubSteps';
import { VerificationSteps } from '../../../src/constants/verificationSteps';
import i18n from '../../../src/data/i18n.json';
import currentLocale from '../../../src/constants/currentLocale';

const language = i18n[currentLocale.locale].subSteps;

const expectedSubSteps = {
  checkAuthenticity: {
    code: SUB_STEPS.checkAuthenticity,
    label: language.checkAuthenticityLabel,
    labelPending: language.checkAuthenticityLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  checkExpiresDate: {
    code: SUB_STEPS.checkExpiresDate,
    label: language.checkExpiresDateLabel,
    labelPending: language.checkExpiresDateLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  checkIssuerIdentity: {
    code: SUB_STEPS.checkIssuerIdentity,
    label: language.checkIssuerIdentityLabel,
    labelPending: language.checkIssuerIdentityLabelPending,
    parentStep: VerificationSteps.identityVerification
  },
  checkIssuerSignature: {
    code: SUB_STEPS.checkIssuerSignature,
    label: language.checkIssuerSignatureLabel,
    labelPending: language.checkIssuerSignatureLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  checkMerkleRoot: {
    code: SUB_STEPS.checkMerkleRoot,
    label: language.checkMerkleRootLabel,
    labelPending: language.checkMerkleRootLabelPending,
    parentStep: VerificationSteps.hashComparison
  },
  checkReceipt: {
    code: SUB_STEPS.checkReceipt,
    label: language.checkReceiptLabel,
    labelPending: language.checkReceiptLabelPending,
    parentStep: VerificationSteps.hashComparison
  },
  checkRevokedStatus: {
    code: SUB_STEPS.checkRevokedStatus,
    label: language.checkRevokedStatusLabel,
    labelPending: language.checkRevokedStatusLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  compareHashes: {
    code: SUB_STEPS.compareHashes,
    label: language.compareHashesLabel,
    labelPending: language.compareHashesLabelPending,
    parentStep: VerificationSteps.hashComparison
  },
  computeLocalHash: {
    code: SUB_STEPS.computeLocalHash,
    label: language.computeLocalHashLabel,
    labelPending: language.computeLocalHashLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  fetchRemoteHash: {
    code: SUB_STEPS.fetchRemoteHash,
    label: language.fetchRemoteHashLabel,
    labelPending: language.fetchRemoteHashLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  getIssuerProfile: {
    code: SUB_STEPS.getIssuerProfile,
    label: language.getIssuerProfileLabel,
    labelPending: language.getIssuerProfileLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  getTransactionId: {
    code: SUB_STEPS.getTransactionId,
    label: language.getTransactionIdLabel,
    labelPending: language.getTransactionIdLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  parseIssuerKeys: {
    code: SUB_STEPS.parseIssuerKeys,
    label: language.parseIssuerKeysLabel,
    labelPending: language.parseIssuerKeysLabelPending,
    parentStep: VerificationSteps.formatValidation
  }
};

describe('verificationSubSteps test suite', function () {
  describe('language property', function () {
    it('should output the expected shape', function () {
      expect(substepsList).toEqual(expectedSubSteps);
    });
  });
});
