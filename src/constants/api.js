const TRANSACTION_APIS = {
  Bitpay: 'bitpay',
  Blockcypher: 'blockcypher',
  Blockexplorer: 'blockexplorer',
  Blockstream: 'blockstream',
  Etherscan: 'etherscan',
  EtherscanBlockNumber: 'etherscanBlockNumber',
  EtherscanScanBlock: 'etherscanScanBlock'
};

const TRANSACTION_ID_PLACEHOLDER = '{transaction_id}';
const BLOCK_NUMBER_PLACEHOLDER = '{block_number}';

const TRANSACTIONS_APIS_URLS = {
  [TRANSACTION_APIS.Bitpay]: {
    main: `https://insight.bitpay.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
    test: `https://api.bitcore.io/api/BTC/testnet/tx/${TRANSACTION_ID_PLACEHOLDER}`
  },
  [TRANSACTION_APIS.Blockcypher]: {
    main: `https://api.blockcypher.com/v1/btc/main/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`,
    test: `https://api.blockcypher.com/v1/btc/test3/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`
  },
  [TRANSACTION_APIS.Blockexplorer]: {
    main: `https://blockexplorer.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
    test: `https://testnet.blockexplorer.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
  },
  [TRANSACTION_APIS.Blockstream]: {
    main: `https://blockstream.info/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
    test: `https://blockstream.info/testnet/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
  },
  // Add &apikey={key} to EtherScan URL's if getting rate limited
  [TRANSACTION_APIS.Etherscan]: {
    main: `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`,
    test: `https://api-ropsten.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`
  },
  [TRANSACTION_APIS.EtherscanBlockNumber]: {
    main: `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber`,
    test: `https://api-ropsten.etherscan.io/api?module=proxy&action=eth_blockNumber`
  },
  [TRANSACTION_APIS.EtherscanScanBlock]: {
    main: `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&boolean=true&tag=${BLOCK_NUMBER_PLACEHOLDER}`,
    test: `https://api-ropsten.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&boolean=true&tag=${BLOCK_NUMBER_PLACEHOLDER}`
  }
};

export {
  TRANSACTION_APIS,
  TRANSACTIONS_APIS_URLS,
  TRANSACTION_ID_PLACEHOLDER,
  BLOCK_NUMBER_PLACEHOLDER
};
