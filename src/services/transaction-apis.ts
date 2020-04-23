import { ExplorerURLs } from '../certificate';
import { TRANSACTION_ID_PLACEHOLDER } from '../constants/api';

export function buildTransactionServiceUrl ({
  serviceUrls,
  transactionIdPlaceholder = TRANSACTION_ID_PLACEHOLDER,
  transactionId = '',
  isTestApi = false
}: {
  serviceUrls: string | ExplorerURLs;
  transactionIdPlaceholder?: string;
  transactionId?: string;
  isTestApi?: boolean;
}): string {
  const apiUrl = typeof serviceUrls === 'string' ? serviceUrls : (isTestApi ? serviceUrls.test : serviceUrls.main);
  return apiUrl.replace(transactionIdPlaceholder, transactionId);
}
