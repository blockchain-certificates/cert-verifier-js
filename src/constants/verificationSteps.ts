import { IVerificationSubstep } from './verificationSubSteps';

export const final = 'final';

export enum VerificationSteps {
  formatValidation = 'formatValidation',
  hashComparison = 'hashComparison',
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

export const language: TVerificationStepsList = {
  [VerificationSteps.formatValidation]: {
    label: 'Format validation',
    labelPending: 'Validating format',
    subSteps: []
  },
  [VerificationSteps.hashComparison]: {
    label: 'Hash comparison',
    labelPending: 'Comparing hash',
    subSteps: []
  },
  [VerificationSteps.statusCheck]: {
    label: 'Status check',
    labelPending: 'Checking record status',
    subSteps: []
  }
};
