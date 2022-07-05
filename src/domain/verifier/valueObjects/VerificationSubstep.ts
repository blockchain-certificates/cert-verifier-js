import domain from '../../../domain/index.js';
import { VERIFICATION_STATUSES } from '../../../constants/verificationStatuses.js';
import type { VerificationSteps } from '../../../constants/verificationSteps.js';

export default class VerificationSubstep {
  public code: string;
  public label: string;
  public labelPending: string;
  public parentStep: string | VerificationSteps;
  public status: VERIFICATION_STATUSES;

  constructor (parentStepKey: string | VerificationSteps, subStepKey: string) {
    this.code = subStepKey;
    this.label = domain.i18n.getText('subSteps', `${subStepKey}Label`);
    this.labelPending = domain.i18n.getText('subSteps', `${subStepKey}LabelPending`);
    this.parentStep = parentStepKey;
    this.status = VERIFICATION_STATUSES.DEFAULT;
  }
}
