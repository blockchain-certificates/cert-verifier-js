import { ExplorerURLs } from '../certificate';

export function buildTransactionServiceUrl ({
  serviceUrls,
  transactionIdPlaceholder = '',
  transactionId = '',
  isTestApi = false
}: {
  serviceUrls: ExplorerURLs,
  transactionIdPlaceholder?: string,
  transactionId?: string,
  isTestApi?: boolean
}): string {
  const apiUrl = isTestApi ? serviceUrls.test : serviceUrls.main;
  return apiUrl.replace(transactionIdPlaceholder, transactionId);
}
