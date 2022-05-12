import { VerifierError } from '../../models';
import domain from '../../domain';
import { baseError } from './index';

export default function compareIssuingAddress (issuingAddress: string, derivedIssuingAddress: string): void {
  if (issuingAddress !== derivedIssuingAddress) {
    throw new VerifierError('compareIssuingAddress', `${baseError} - ${domain.i18n.getText('errors', 'compareIssuingAddress')}`);
  }
}
