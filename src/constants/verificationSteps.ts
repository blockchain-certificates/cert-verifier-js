import type { IVerificationSubstep } from './verificationSubSteps';
import i18n from '../data/i18n.json';
import currentLocale from './currentLocale';

const defaultLanguageSet = i18n[currentLocale.locale];

export const final = 'final';

export enum VerificationSteps {
  formatValidation = 'formatValidation',
  hashComparison = 'hashComparison',
  identityVerification = 'identityVerification',
  statusCheck = 'statusCheck',
  final = 'final'
}

export type TVerificationStepsList = {
  [key in VerificationSteps]?: {
    label: string;
    labelPending: string;
    subSteps: IVerificationSubstep[];
  };
};

export default function getMainVerificationSteps (hasDid: boolean = false): TVerificationStepsList {
  return {
    [VerificationSteps.formatValidation]: {
      label: defaultLanguageSet.steps.formatValidationLabel,
      labelPending: defaultLanguageSet.steps.formatValidationLabelPending,
      subSteps: []
    },
    [VerificationSteps.hashComparison]: {
      label: defaultLanguageSet.steps.hashComparisonLabel,
      labelPending: defaultLanguageSet.steps.hashComparisonLabelPending,
      subSteps: []
    },
    ...(hasDid) && {
      [VerificationSteps.identityVerification]: {
        label: defaultLanguageSet.steps.identityVerificationLabel,
        labelPending: defaultLanguageSet.steps.identityVerificationLabelPending,
        subSteps: []
      }
    },
    [VerificationSteps.statusCheck]: {
      label: defaultLanguageSet.steps.statusCheckLabel,
      labelPending: defaultLanguageSet.steps.statusCheckLabelPending,
      subSteps: []
    }
  };
}
