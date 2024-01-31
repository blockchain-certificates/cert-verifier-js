import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../constants/verificationSteps';
import { getText } from '../domain/i18n/useCases';

export default function ensureValidityPeriodStarted (validFrom = null): void {
  if (!validFrom) {
    return;
  }
  const validFromDate = dateToUnixTimestamp(validFrom);
  const today = new Date();
  if (validFromDate > today.getTime()) {
    throw new VerifierError(
      SUB_STEPS.ensureValidityPeriodStarted,
      getText('errors', 'ensureValidityPeriodStarted')
    );
  }
}
