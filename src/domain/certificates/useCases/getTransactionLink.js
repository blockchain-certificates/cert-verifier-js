import { TRANSACTION_ID_PLACEHOLDER } from '../../../constants';

/**
 * getRawTransactionLink
 *
 * Builds and returns the raw transaction link
 *
 * @param transactionId
 * @param chainObject
 * @param getRawVersion
 * @returns {*}
 */
export default function getTransactionLink (transactionId, chainObject, getRawVersion = false) {
  if (!transactionId || !chainObject) {
    return '';
  }
  const rawTransactionLinkTemplate = chainObject.transactionTemplates[getRawVersion ? 'raw' : 'full'];
  return rawTransactionLinkTemplate.replace(TRANSACTION_ID_PLACEHOLDER, transactionId);
}
