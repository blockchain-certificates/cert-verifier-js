import { request } from '../../services/request';
import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';
import { buildTransactionServiceUrl } from '../../services/transaction-apis';
import { isTestChain, SupportedChains } from '../../constants/blockchains';
import { TransactionData } from '../../models/TransactionData';
import { ExplorerAPI, ExplorerURLs } from '../../certificate';
import { TRANSACTION_APIS } from '../../constants/api';

const MAIN_API_BASE_URL = 'https://api.etherscan.io/api?module=proxy';
const TEST_API_BASE_URL = 'https://api-ropsten.etherscan.io/api?module=proxy';
const serviceURL: ExplorerURLs = {
  main: `${MAIN_API_BASE_URL}&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`,
  test: `${TEST_API_BASE_URL}&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`
};

async function parsingFunction (jsonResponse, chain: SupportedChains, key: string, keyPropertyName: string): Promise<TransactionData> {
  const getBlockByNumberServiceUrls: Partial<ExplorerAPI> = {
    serviceURL: {
      main: `${MAIN_API_BASE_URL}&action=eth_getBlockByNumber&boolean=true&tag=${TRANSACTION_ID_PLACEHOLDER}`,
      test: `${TEST_API_BASE_URL}&action=eth_getBlockByNumber&boolean=true&tag=${TRANSACTION_ID_PLACEHOLDER}`
    }
  };
  const getBlockNumberServiceUrls: Partial<ExplorerAPI> = {
    serviceURL: {
      main: `${MAIN_API_BASE_URL}&action=eth_blockNumber`,
      test: `${TEST_API_BASE_URL}&action=eth_blockNumber`
    }
  };

  function parseEtherScanResponse (jsonResponse, block): TransactionData {
    const data = jsonResponse.result;
    const time: Date = new Date(parseInt(block.timestamp, 16) * 1000);
    const issuingAddress: string = data.from;
    const remoteHash = stripHashPrefix(data.input, BLOCKCHAINS.ethmain.prefixes); // remove '0x'

    // The method of checking revocations by output spent do not work with Ethereum.
    // There are no input/outputs, only balances.
    return {
      remoteHash,
      issuingAddress,
      time,
      revokedAddresses: []
    };
  }

  async function getEtherScanBlock (jsonResponse, chain: SupportedChains): Promise<any> {
    const data = jsonResponse.result;
    const blockNumber = data.blockNumber;
    const requestUrl = buildTransactionServiceUrl({
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      explorerAPI: {
        ...getBlockByNumberServiceUrls,
        key,
        keyPropertyName
      } as ExplorerAPI,
      transactionId: blockNumber,
      isTestApi: isTestChain(chain)
    });

    try {
      const response = await request({ url: requestUrl });
      const responseData = JSON.parse(response);
      const blockData = responseData.result;

      await checkEtherScanConfirmations(chain, blockNumber);
      return blockData;
    } catch (err) {
      throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
    }
  }

  async function checkEtherScanConfirmations (chain: SupportedChains, blockNumber: number): Promise<number> {
    const requestUrl: string = buildTransactionServiceUrl({
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      explorerAPI: {
        ...getBlockNumberServiceUrls,
        key,
        keyPropertyName
      } as ExplorerAPI,
      isTestApi: isTestChain(chain)
    });

    let response: string;
    try {
      response = await request({ url: requestUrl });
    } catch (err) {
      throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
    }

    const responseData = JSON.parse(response);
    const currentBlockCount: number = responseData.result;

    if (currentBlockCount - blockNumber < CONFIG.MininumConfirmations) {
      throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'checkEtherScanConfirmations'));
    }
    return currentBlockCount;
  }

  // Parse block to get timestamp first, then create TransactionData
  const blockResponse = await getEtherScanBlock(jsonResponse, chain);
  return parseEtherScanResponse(jsonResponse, blockResponse);
}

export const explorerApi: ExplorerAPI = {
  serviceURL,
  serviceName: TRANSACTION_APIS.etherscan,
  parsingFunction,
  priority: -1
};
