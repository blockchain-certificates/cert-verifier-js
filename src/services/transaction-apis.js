export function buildTransactionServiceUrl ({ serviceUrls, transactionIdPlaceholder = '', transactionId = '', testApi = false }) {
  const apiUrl = testApi ? serviceUrls.test : serviceUrls.main;
  return apiUrl.replace(transactionIdPlaceholder, transactionId);
}
