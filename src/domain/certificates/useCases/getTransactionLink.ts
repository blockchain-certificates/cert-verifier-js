import { TRANSACTION_ID_PLACEHOLDER } from '../../../constants';
import type { IBlockchainObject } from '@blockcerts/explorer-lookup';

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

export interface ITransactionLink {
  rawTransactionLink: string;
  transactionLink: string;
}

export default function getTransactionLink (transactionId: string, chainObject: IBlockchainObject): ITransactionLink {
  if (!transactionId || !chainObject) {
    return null;
  }

  return {
    rawTransactionLink: chainObject.transactionTemplates.raw.replace(TRANSACTION_ID_PLACEHOLDER, transactionId),
    transactionLink: chainObject.transactionTemplates.full.replace(TRANSACTION_ID_PLACEHOLDER, transactionId)
  };
}
