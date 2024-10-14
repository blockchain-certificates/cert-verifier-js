import { validateDateTimeStamp } from '../helpers/date';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import { getText } from '../domain/i18n/useCases';

export default function validateDateFormat (dateTimeStamp: string, property: string): void {
  if (!validateDateTimeStamp(dateTimeStamp)) {
    throw new VerifierError(SUB_STEPS.validateDateFormat, `${getText('errors', 'validateDateFormat')}: ${property}`);
  }
}
