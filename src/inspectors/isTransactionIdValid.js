import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';

/**
 * isTransactionIdValid
 *
 * @param transactionId
 * @returns {string}
 */
export default function isTransactionIdValid (transactionId) {
  if (typeof transactionId === 'string' && transactionId.length > 0) {
    return transactionId;
  } else {
    throw new VerifierError(
      SUB_STEPS.getTransactionId,
      'Cannot verify this certificate without a transaction ID to compare against.'
    );
  }
}
