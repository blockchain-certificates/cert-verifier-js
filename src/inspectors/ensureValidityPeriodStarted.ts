import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../constants/verificationSteps';
import { getText } from '../domain/i18n/useCases';

export default function ensureValidityPeriodStarted (validFrom = null): void {
  console.log('check validFrom', validFrom);
  if (!validFrom) {
    console.log('nothing to check');
    return;
  }
  const validFromDate = dateToUnixTimestamp(validFrom);
  const today = new Date();
  console.log('compare validFrom', validFromDate, 'to now', today.getTime());
  if (validFromDate > today.getTime()) {
    console.log('error in validity');
    throw new VerifierError(
      SUB_STEPS.ensureValidityPeriodStarted,
      getText('errors', 'ensureValidityPeriodStarted')
    );
  }
}
