import { VerificationSteps, SUB_STEPS } from '../../../../../../src/constants/verificationSteps';
import i18n from '../../../../../../src/data/i18n.json';
import currentLocale from '../../../../../../src/constants/currentLocale';
import { VERIFICATION_STATUSES } from '../../../../../../src';

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
        parentStep: VerificationSteps.formatValidation,
        status: VERIFICATION_STATUSES.DEFAULT
      }
    ]
  },
  {
    code: VerificationSteps.proofVerification,
    label: defaultLanguageSet.steps.signatureVerificationLabel,
    labelPending: defaultLanguageSet.steps.signatureVerificationLabelPending,
    subSteps: []
  },
  {
    code: VerificationSteps.identityVerification,
    label: defaultLanguageSet.steps.identityVerificationLabel,
    labelPending: defaultLanguageSet.steps.identityVerificationLabelPending,
    subSteps: []
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
