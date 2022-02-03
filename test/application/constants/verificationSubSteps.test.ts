import { SUB_STEPS, substepsList } from '../../../src/constants/verificationSubSteps';
import { VerificationSteps } from '../../../src/constants/verificationSteps';
import i18n from '../../../src/data/i18n.json';
import currentLocale from '../../../src/constants/currentLocale';

const language = i18n[currentLocale.locale].subSteps;

const expectedSubSteps = {
  [SUB_STEPS.checkAuthenticity]: {
    code: SUB_STEPS.checkAuthenticity,
    label: language.checkAuthenticityLabel,
    labelPending: language.checkAuthenticityLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  [SUB_STEPS.checkExpiresDate]: {
    code: SUB_STEPS.checkExpiresDate,
    label: language.checkExpiresDateLabel,
    labelPending: language.checkExpiresDateLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  [SUB_STEPS.checkIssuerSignature]: {
    code: SUB_STEPS.checkIssuerSignature,
    label: language.checkIssuerSignatureLabel,
    labelPending: language.checkIssuerSignatureLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  [SUB_STEPS.checkMerkleRoot]: {
    code: SUB_STEPS.checkMerkleRoot,
    label: language.checkMerkleRootLabel,
    labelPending: language.checkMerkleRootLabelPending,
    parentStep: VerificationSteps.hashComparison
  },
  [SUB_STEPS.checkReceipt]: {
    code: SUB_STEPS.checkReceipt,
    label: language.checkReceiptLabel,
    labelPending: language.checkReceiptLabelPending,
    parentStep: VerificationSteps.hashComparison
  },
  [SUB_STEPS.checkRevokedStatus]: {
    code: SUB_STEPS.checkRevokedStatus,
    label: language.checkRevokedStatusLabel,
    labelPending: language.checkRevokedStatusLabelPending,
    parentStep: VerificationSteps.statusCheck
  },
  [SUB_STEPS.compareHashes]: {
    code: SUB_STEPS.compareHashes,
    label: language.compareHashesLabel,
    labelPending: language.compareHashesLabelPending,
    parentStep: VerificationSteps.hashComparison
  },
  [SUB_STEPS.computeLocalHash]: {
    code: SUB_STEPS.computeLocalHash,
    label: language.computeLocalHashLabel,
    labelPending: language.computeLocalHashLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  [SUB_STEPS.fetchRemoteHash]: {
    code: SUB_STEPS.fetchRemoteHash,
    label: language.fetchRemoteHashLabel,
    labelPending: language.fetchRemoteHashLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  [SUB_STEPS.getIssuerProfile]: {
    code: SUB_STEPS.getIssuerProfile,
    label: language.getIssuerProfileLabel,
    labelPending: language.getIssuerProfileLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  [SUB_STEPS.getTransactionId]: {
    code: SUB_STEPS.getTransactionId,
    label: language.getTransactionIdLabel,
    labelPending: language.getTransactionIdLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  [SUB_STEPS.parseIssuerKeys]: {
    code: SUB_STEPS.parseIssuerKeys,
    label: language.parseIssuerKeysLabel,
    labelPending: language.parseIssuerKeysLabelPending,
    parentStep: VerificationSteps.formatValidation
  },
  [SUB_STEPS.retrieveVerificationMethodPublicKey]: {
    code: SUB_STEPS.retrieveVerificationMethodPublicKey,
    label: language.retrieveVerificationMethodPublicKeyLabel,
    labelPending: language.retrieveVerificationMethodPublicKeyLabelPending,
    parentStep: VerificationSteps.identityVerification
  },
  [SUB_STEPS.controlVerificationMethod]: {
    code: SUB_STEPS.controlVerificationMethod,
    label: language.controlVerificationMethodLabel,
    labelPending: language.controlVerificationMethodLabelPending,
    parentStep: VerificationSteps.identityVerification
  },
  [SUB_STEPS.retrieveVerificationMethodPublicKey]: {
    code: SUB_STEPS.retrieveVerificationMethodPublicKey,
    label: language.retrieveVerificationMethodPublicKeyLabel,
    labelPending: language.retrieveVerificationMethodPublicKeyLabelPending,
    parentStep: VerificationSteps.identityVerification
  },
  [SUB_STEPS.deriveIssuingAddressFromPublicKey]: {
    code: SUB_STEPS.deriveIssuingAddressFromPublicKey,
    label: language.deriveIssuingAddressFromPublicKeyLabel,
    labelPending: language.deriveIssuingAddressFromPublicKeyLabelPending,
    parentStep: VerificationSteps.identityVerification
  },
  [SUB_STEPS.compareIssuingAddress]: {
    code: SUB_STEPS.compareIssuingAddress,
    label: language.compareIssuingAddressLabel,
    labelPending: language.compareIssuingAddressLabelPending,
    parentStep: VerificationSteps.identityVerification
  }
};

describe('verificationSubSteps test suite', function () {
  describe('language property', function () {
    it('should output the expected shape', function () {
      expect(substepsList).toEqual(expectedSubSteps);
    });
  });
});
