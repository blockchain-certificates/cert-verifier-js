import { SUB_STEPS, VerificationSteps } from '../../src/constants/verificationSteps';
import i18n from '../../src/data/i18n.json';
import currentLocale from '../../src/constants/currentLocale';
import { VERIFICATION_STATUSES } from '../../src';

const defaultLanguageSet = i18n[currentLocale.locale];

const merkleProof2019VerificationSubsteps = [
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
];

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
        parentStep: VerificationSteps.formatValidation,
        status: VERIFICATION_STATUSES.DEFAULT
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
        proofType: 'Ed25519Signature2020',
        subSteps: [
          {
            code: 'retrieveVerificationMethodPublicKey',
            label: defaultLanguageSet.subSteps.retrieveVerificationMethodPublicKeyLabel,
            labelPending: defaultLanguageSet.subSteps.retrieveVerificationMethodPublicKeyLabelPending,
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'checkDocumentSignature',
            label: 'Check document signature',
            labelPending: 'Checking document signature',
            parentStep: VerificationSteps.proofVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          }
        ]
      },
      {
        proofType: 'MerkleProof2019',
        subSteps: merkleProof2019VerificationSubsteps
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
        proofType: 'Ed25519Signature2020',
        subSteps: []
      },
      {
        proofType: 'MerkleProof2019',
        subSteps: [
          {
            code: 'retrieveVerificationMethodPublicKey',
            label: defaultLanguageSet.subSteps.retrieveVerificationMethodPublicKeyLabel,
            labelPending: defaultLanguageSet.subSteps.retrieveVerificationMethodPublicKeyLabelPending,
            parentStep: VerificationSteps.identityVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          },
          {
            code: 'deriveIssuingAddressFromPublicKey',
            label: defaultLanguageSet.subSteps.deriveIssuingAddressFromPublicKeyLabel,
            labelPending: defaultLanguageSet.subSteps.deriveIssuingAddressFromPublicKeyLabelPending,
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
        code: SUB_STEPS.checkExpiresDate,
        label: defaultLanguageSet.subSteps.checkExpiresDateLabel,
        labelPending: defaultLanguageSet.subSteps.checkExpiresDateLabelPending,
        parentStep: VerificationSteps.statusCheck,
        status: VERIFICATION_STATUSES.DEFAULT
      }
    ]
  }
];
