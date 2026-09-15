import VerifierError from '../models/verifierError';
import { ProblemDetailsType } from '../models/ProblemDetails';
import { getText } from '../domain/i18n/useCases';

/**
 * isTransactionIdValid
 *
 * @param transactionId
 * @returns {string}
 */
export default function isTransactionIdValid (transactionId: string): string {
  if (typeof transactionId === 'string' && transactionId.length > 0) {
    return transactionId;
  } else {
    throw new VerifierError(
      'getTransactionId',
      getText('errors', 'isTransactionIdValid'),
      ProblemDetailsType.MALFORMED_VALUE_ERROR
    );
  }
}
