import { VerificationSteps, SUB_STEPS } from '../../../../../../src/domain/verifier/entities/verificationSteps';
import i18n from '../../../../../../src/data/i18n.json';
import currentLocale from '../../../../../../src/constants/currentLocale';
import type { IVerificationMapItem } from '../../../../../../src/models/VerificationMap';
import { VERIFICATION_STATUSES } from '../../../../../../src';

const defaultLanguageSet = i18n[currentLocale.locale];

const mainnetStepMapAssertion: IVerificationMapItem[] = [
  {
    code: VerificationSteps.formatValidation,
    label: defaultLanguageSet.steps.formatValidationLabel,
    labelPending: defaultLanguageSet.steps.formatValidationLabelPending,
    subSteps: []
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

export default mainnetStepMapAssertion;
