import i18n from '../../../data/i18n.json';
import currentLocale from '../../../constants/currentLocale';
import type { IVerificationMapItem } from '../../../models/VerificationMap';

const defaultLanguageSet = i18n[currentLocale.locale];

export const final = 'final';

export enum VerificationSteps {
  formatValidation = 'formatValidation',
  proofVerification = 'proofVerification',
  identityVerification = 'identityVerification',
  statusCheck = 'statusCheck',
  final = 'final'
}

export enum SUB_STEPS {
  checkImagesIntegrity = 'checkImagesIntegrity',
  checkRevokedStatus = 'checkRevokedStatus',
  checkExpiresDate = 'checkExpiresDate',
  controlVerificationMethod = 'controlVerificationMethod',
  verifyIssuerProfile = 'verifyIssuerProfile',
  ensureValidityPeriodStarted = 'ensureValidityPeriodStarted',
  checkCredentialSchemaConformity = 'checkCredentialSchemaConformity',
  validateDateFormat = 'validateDateFormat'
}

export type TVerificationStepsList = {
  [key in VerificationSteps]?: IVerificationMapItem;
};

export const verificationMap = {
  [VerificationSteps.formatValidation]: [
    SUB_STEPS.checkImagesIntegrity,
    SUB_STEPS.checkCredentialSchemaConformity,
    SUB_STEPS.validateDateFormat
  ],
  [VerificationSteps.proofVerification]: [],
  [VerificationSteps.identityVerification]: [
    SUB_STEPS.verifyIssuerProfile,
    SUB_STEPS.controlVerificationMethod
  ],
  [VerificationSteps.statusCheck]: [
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.ensureValidityPeriodStarted,
    SUB_STEPS.checkExpiresDate
  ]
};

export default function getParentVerificationSteps (): TVerificationStepsList {
  return {
    [VerificationSteps.formatValidation]: {
      code: VerificationSteps.formatValidation,
      label: defaultLanguageSet.steps.formatValidationLabel,
      labelPending: defaultLanguageSet.steps.formatValidationLabelPending,
      subSteps: []
    },
    [VerificationSteps.proofVerification]: {
      code: VerificationSteps.proofVerification,
      label: defaultLanguageSet.steps.signatureVerificationLabel,
      labelPending: defaultLanguageSet.steps.signatureVerificationLabelPending,
      subSteps: []
    },
    [VerificationSteps.identityVerification]: {
      code: VerificationSteps.identityVerification,
      label: defaultLanguageSet.steps.identityVerificationLabel,
      labelPending: defaultLanguageSet.steps.identityVerificationLabelPending,
      subSteps: []
    },
    [VerificationSteps.statusCheck]: {
      code: VerificationSteps.statusCheck,
      label: defaultLanguageSet.steps.statusCheckLabel,
      labelPending: defaultLanguageSet.steps.statusCheckLabelPending,
      subSteps: []
    }
  };
}
