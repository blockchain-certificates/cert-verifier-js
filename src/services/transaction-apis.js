export function buildTransactionServiceUrl ({ serviceUrls, searchValue = '', newValue = '', testApi = false }) {
  const apiUrl = testApi ? serviceUrls.test : serviceUrls.main;
  return apiUrl.replace(searchValue, newValue);
}
