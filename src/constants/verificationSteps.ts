import i18n from '../data/i18n.json';
import currentLocale from './currentLocale.js';
import type { IVerificationMapItem } from '../models/VerificationMap.js';

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
  controlVerificationMethod = 'controlVerificationMethod'
}

export type TVerificationStepsList = {
  [key in VerificationSteps]?: IVerificationMapItem;
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
