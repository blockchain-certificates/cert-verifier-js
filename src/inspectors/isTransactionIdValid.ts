import VerifierError from '../models/VerifierError.js';
import domain from '../domain/index.js';

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
      domain.i18n.getText('errors', 'isTransactionIdValid')
    );
  }
}
