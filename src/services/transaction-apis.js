export function buildTransactionServiceUrl ({ serviceUrls, transactionIdPlaceholder = '', transactionId = '', isTestApi = false }) {
  const apiUrl = isTestApi ? serviceUrls.test : serviceUrls.main;
  return apiUrl.replace(transactionIdPlaceholder, transactionId);
}
