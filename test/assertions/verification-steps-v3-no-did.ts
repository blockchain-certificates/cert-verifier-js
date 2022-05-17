import { SUB_STEPS, VerificationSteps } from '../../src/constants/verificationSteps';
import i18n from '../../src/data/i18n.json';
import currentLocale from '../../src/constants/currentLocale';

const defaultLanguageSet = i18n[currentLocale.locale];

export default [
  {
    code: VerificationSteps.formatValidation,
    label: defaultLanguageSet.steps.formatValidationLabel,
    labelPending: defaultLanguageSet.steps.formatValidationLabelPending,
    subSteps: [
      {
        code: SUB_STEPS.checkImagesIntegrity,
        label: defaultLanguageSet.subSteps.checkImagesIntegrityLabel,
        labelPending: defaultLanguageSet.subSteps.checkImagesIntegrityLabelPending,
        parentStep: VerificationSteps.formatValidation
      }
    ]
  },
  {
    code: VerificationSteps.proofVerification,
    label: defaultLanguageSet.steps.signatureVerificationLabel,
    labelPending: defaultLanguageSet.steps.signatureVerificationLabelPending,
    subSteps: [],
    suites: [
      {
        proofType: 'MerkleProof2019',
        subSteps: [
          {
            code: 'getTransactionId',
            label: defaultLanguageSet.subSteps.getTransactionIdLabel,
            labelPending: defaultLanguageSet.subSteps.getTransactionIdLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'computeLocalHash',
            label: defaultLanguageSet.subSteps.computeLocalHashLabel,
            labelPending: defaultLanguageSet.subSteps.computeLocalHashLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'fetchRemoteHash',
            label: defaultLanguageSet.subSteps.fetchRemoteHashLabel,
            labelPending: defaultLanguageSet.subSteps.fetchRemoteHashLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'compareHashes',
            label: defaultLanguageSet.subSteps.compareHashesLabel,
            labelPending: defaultLanguageSet.subSteps.compareHashesLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'checkMerkleRoot',
            label: defaultLanguageSet.subSteps.checkMerkleRootLabel,
            labelPending: defaultLanguageSet.subSteps.checkMerkleRootLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'checkReceipt',
            label: defaultLanguageSet.subSteps.checkReceiptLabel,
            labelPending: defaultLanguageSet.subSteps.checkReceiptLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'parseIssuerKeys',
            label: defaultLanguageSet.subSteps.parseIssuerKeysLabel,
            labelPending: defaultLanguageSet.subSteps.parseIssuerKeysLabelPending,
            parentStep: VerificationSteps.proofVerification
          },
          {
            code: 'checkAuthenticity',
            label: defaultLanguageSet.subSteps.checkAuthenticityLabel,
            labelPending: defaultLanguageSet.subSteps.checkAuthenticityLabelPending,
            parentStep: VerificationSteps.proofVerification
          }
        ]
      }
    ]
  },
  {
    code: VerificationSteps.statusCheck,
    label: defaultLanguageSet.steps.statusCheckLabel,
    labelPending: defaultLanguageSet.steps.statusCheckLabelPending,
    subSteps: [
      {
        code: SUB_STEPS.checkRevokedStatus,
        label: defaultLanguageSet.subSteps.checkRevokedStatusLabel,
        labelPending: defaultLanguageSet.subSteps.checkRevokedStatusLabelPending,
        parentStep: VerificationSteps.statusCheck
      },
      {
        code: SUB_STEPS.checkExpiresDate,
        label: defaultLanguageSet.subSteps.checkExpiresDateLabel,
        labelPending: defaultLanguageSet.subSteps.checkExpiresDateLabelPending,
        parentStep: VerificationSteps.statusCheck
      }
    ]
  }
];
