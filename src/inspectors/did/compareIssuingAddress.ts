import { VerifierError } from '../../models';
import { SUB_STEPS } from '../../constants';
import domain from '../../domain';
import { baseError } from './index';

export default function compareIssuingAddress (issuingAddress: string, derivedIssuingAddress: string): void {
  if (issuingAddress !== derivedIssuingAddress) {
    throw new VerifierError(SUB_STEPS.compareIssuingAddress, `${baseError} - ${domain.i18n.getText('errors', 'compareIssuingAddress')}`);
  }
}
