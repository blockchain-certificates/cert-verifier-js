import VerifierError from '../../models/VerifierError.js';
import domain from '../../domain/index.js';
import { baseError } from './index.js';

export default function compareIssuingAddress (issuingAddress: string, derivedIssuingAddress: string): void {
  if (issuingAddress !== derivedIssuingAddress) {
    throw new VerifierError('compareIssuingAddress', `${baseError} - ${domain.i18n.getText('errors', 'compareIssuingAddress')}`);
  }
}
