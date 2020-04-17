import { ExplorerURLs } from '../certificate';

export function buildTransactionServiceUrl ({
  serviceUrls,
  transactionIdPlaceholder = '',
  transactionId = '',
  isTestApi = false
}: {
  serviceUrls: string | ExplorerURLs,
  transactionIdPlaceholder?: string,
  transactionId?: string,
  isTestApi?: boolean
}): string {
  const apiUrl = typeof serviceUrls === 'string' ? serviceUrls : (isTestApi ? serviceUrls.test : serviceUrls.main);
  return apiUrl.replace(transactionIdPlaceholder, transactionId);
}
