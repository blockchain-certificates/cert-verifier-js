import { TRANSACTION_TEMPLATE_ID_PLACEHOLDER } from '../../../constants/blockchains';

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
  const rawTransactionLinkTemplate = chainObject.transactionTemplates[getRawVersion ? 'raw' : 'full'];
  return rawTransactionLinkTemplate.replace(TRANSACTION_TEMPLATE_ID_PLACEHOLDER, transactionId);
}
