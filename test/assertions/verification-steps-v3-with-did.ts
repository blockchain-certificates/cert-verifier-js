import { SUB_STEPS, VerificationSteps } from '../../src/domain/verifier/entities/verificationSteps';
import i18n from '../../src/data/i18n.json';
import currentLocale from '../../src/constants/currentLocale';
import { VERIFICATION_STATUSES } from '../../src';

const defaultLanguageSet = i18n[currentLocale.locale];

export default [
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
            code: 'assertProofValidity',
            label: defaultLanguageSet.subSteps.assertProofValidityLabel,
            labelPending: defaultLanguageSet.subSteps.assertProofValidityLabelPending,
            parentStep: 'proofVerification',
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'getTransactionId',
            label: defaultLanguageSet.subSteps.getTransactionIdLabel,
            labelPending: defaultLanguageSet.subSteps.getTransactionIdLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'computeLocalHash',
            label: defaultLanguageSet.subSteps.computeLocalHashLabel,
            labelPending: defaultLanguageSet.subSteps.computeLocalHashLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'fetchRemoteHash',
            label: defaultLanguageSet.subSteps.fetchRemoteHashLabel,
            labelPending: defaultLanguageSet.subSteps.fetchRemoteHashLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'compareHashes',
            label: defaultLanguageSet.subSteps.compareHashesLabel,
            labelPending: defaultLanguageSet.subSteps.compareHashesLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'checkMerkleRoot',
            label: defaultLanguageSet.subSteps.checkMerkleRootLabel,
            labelPending: defaultLanguageSet.subSteps.checkMerkleRootLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'checkReceipt',
            label: defaultLanguageSet.subSteps.checkReceiptLabel,
            labelPending: defaultLanguageSet.subSteps.checkReceiptLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'parseIssuerKeys',
            label: defaultLanguageSet.subSteps.parseIssuerKeysLabel,
            labelPending: defaultLanguageSet.subSteps.parseIssuerKeysLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'checkAuthenticity',
            label: defaultLanguageSet.subSteps.checkAuthenticityLabel,
            labelPending: defaultLanguageSet.subSteps.checkAuthenticityLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          }
        ]
      }
    ]
  },
  {
    code: VerificationSteps.identityVerification,
    label: defaultLanguageSet.steps.identityVerificationLabel,
    labelPending: defaultLanguageSet.steps.identityVerificationLabelPending,
    subSteps: [
      {
        code: SUB_STEPS.controlVerificationMethod,
        label: defaultLanguageSet.subSteps.controlVerificationMethodLabel,
        labelPending: defaultLanguageSet.subSteps.controlVerificationMethodLabelPending,
        parentStep: VerificationSteps.identityVerification,
        status: VERIFICATION_STATUSES.DEFAULT
      }
    ],
    suites: [
      {
        proofType: 'MerkleProof2019',
        subSteps: [
          {
            code: 'deriveIssuingAddressFromPublicKey',
            label: defaultLanguageSet.subSteps.deriveIssuingAddressFromPublicKeyLabel,
            labelPending: defaultLanguageSet.subSteps.deriveIssuingAddressFromPublicKeyLabelPending,
            parentStep: VerificationSteps.identityVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'ensureVerificationMethodValidity',
            label: defaultLanguageSet.subSteps.ensureVerificationMethodValidityLabel,
            labelPending: defaultLanguageSet.subSteps.ensureVerificationMethodValidityLabelPending,
            parentStep: VerificationSteps.identityVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'compareIssuingAddress',
            label: defaultLanguageSet.subSteps.compareIssuingAddressLabel,
            labelPending: defaultLanguageSet.subSteps.compareIssuingAddressLabelPending,
            parentStep: VerificationSteps.identityVerification,
            status: VERIFICATION_STATUSES.DEFAULT
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
        parentStep: VerificationSteps.statusCheck,
        status: VERIFICATION_STATUSES.DEFAULT
      },
      {
        code: SUB_STEPS.ensureValidityPeriodStarted,
        label: defaultLanguageSet.subSteps.ensureValidityPeriodStartedLabel,
        labelPending: defaultLanguageSet.subSteps.ensureValidityPeriodStartedLabelPending,
        parentStep: VerificationSteps.statusCheck,
        status: VERIFICATION_STATUSES.DEFAULT
      },
      {
        code: SUB_STEPS.checkExpiresDate,
        label: defaultLanguageSet.subSteps.checkExpiresDateLabel,
        labelPending: defaultLanguageSet.subSteps.checkExpiresDateLabelPending,
        parentStep: VerificationSteps.statusCheck,
        status: VERIFICATION_STATUSES.DEFAULT
      }
    ]
  }
];
