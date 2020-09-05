import { ExplorerAPI } from '../certificate';
import { TRANSACTION_ID_PLACEHOLDER } from '../constants/api';
import { safelyAppendUrlParameter } from '../helpers/url';

function appendApiIdentifier (url: string, explorerAPI: ExplorerAPI): string {
  if (!explorerAPI.key) {
    return url;
  }

  if (explorerAPI.key && !explorerAPI.keyPropertyName) {
    throw new Error(`No keyPropertyName defined for explorerAPI ${explorerAPI.serviceName}`);
  }

  return safelyAppendUrlParameter(url, explorerAPI.keyPropertyName, explorerAPI.key);
}

export function buildTransactionServiceUrl ({
  explorerAPI,
  transactionIdPlaceholder = TRANSACTION_ID_PLACEHOLDER,
  transactionId = '',
  isTestApi = false
}: {
  explorerAPI: ExplorerAPI;
  transactionIdPlaceholder?: string;
  transactionId?: string;
  isTestApi?: boolean;
}): string {
  const { serviceURL } = explorerAPI;
  let apiUrl = typeof serviceURL === 'string' ? serviceURL : (isTestApi ? serviceURL.test : serviceURL.main);
  apiUrl = apiUrl.replace(transactionIdPlaceholder, transactionId);
  apiUrl = appendApiIdentifier(apiUrl, explorerAPI);
  return apiUrl;
}
