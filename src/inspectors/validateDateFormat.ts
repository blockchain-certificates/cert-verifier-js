import { validateDateTimeStamp } from '../helpers/date';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import { getText } from '../domain/i18n/useCases';
import type { DatesToValidate } from '../domain/verifier/useCases/getDatesToValidate';

export default function validateDateFormat (dates: DatesToValidate): void {
  for (const { dateTimeStamp, property } of dates) {
    if (!validateDateTimeStamp(dateTimeStamp)) {
      console.error('Date', dateTimeStamp, 'is not valid:', property);
      throw new VerifierError(SUB_STEPS.validateDateFormat, `${getText('errors', 'validateDateFormat')} ${property}`);
    }
  }
}
