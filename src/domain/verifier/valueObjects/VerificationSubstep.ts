import { getText } from '../../i18n/useCases';
import type { VerificationSteps } from '../../../constants/verificationSteps';
import type { VERIFICATION_STATUSES } from '../../../constants/verificationStatuses';

export default class VerificationSubstep {
  public code: string;
  public label: string;
  public labelPending: string;
  public parentStep: string | VerificationSteps;
  public status: VERIFICATION_STATUSES;

  constructor (parentStepKey: string | VerificationSteps, subStepKey: string) {
    this.code = subStepKey;
    this.label = getText('subSteps', `${subStepKey}Label`);
    this.labelPending = getText('subSteps', `${subStepKey}LabelPending`);
    this.parentStep = parentStepKey;
  }
}
